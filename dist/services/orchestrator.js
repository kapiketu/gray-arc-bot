"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onOrchestratorEvent = onOrchestratorEvent;
exports.enqueueTask = enqueueTask;
exports.getQueueStatus = getQueueStatus;
exports.trackCost = trackCost;
exports.getCostReport = getCostReport;
exports.notifyFounder = notifyFounder;
exports.runTask = runTask;
exports.updateProjectState = updateProjectState;
// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATOR AGENT
// Controls the Entire Execution Engine. Manages:
//   - Queue Manager   : Adds tasks, prioritizes execution
//   - Retry Engine    : Handles failures with exponential back-off (max 5 attempts)
//   - Cost Monitor    : Tracks estimated API usage per project
//   - Notification Engine : Sends alerts/updates to Founder
// ─────────────────────────────────────────────────────────────────────────────
const crypto_1 = require("crypto");
const supabaseClient_1 = require("../db/supabaseClient");
const whatsapp_1 = require("./whatsapp");
// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY QUEUE
// For Phase 2 we use an in-memory queue backed by Supabase persistence.
// Tasks survive restarts because they are stored in ai_logs / project_state.
// ─────────────────────────────────────────────────────────────────────────────
const taskQueue = new Map();
const eventListeners = [];
function onOrchestratorEvent(listener) {
    eventListeners.push(listener);
}
function emit(event) {
    eventListeners.forEach(l => l(event));
}
// ─────────────────────────────────────────────────────────────────────────────
// QUEUE MANAGER
// ─────────────────────────────────────────────────────────────────────────────
function enqueueTask(projectId, agentType, action, payload, maxAttempts = 5) {
    const task = {
        id: (0, crypto_1.randomUUID)(),
        projectId,
        agentType,
        action,
        payload,
        status: 'Pending',
        attempts: 0,
        maxAttempts,
        createdAt: new Date().toISOString(),
        nextRunAt: new Date().toISOString(),
    };
    taskQueue.set(task.id, task);
    emit({ type: 'TASK_QUEUED', task });
    console.log(`[QueueManager] Task queued: ${agentType}::${action} (Project: ${projectId})`);
    return task;
}
function getQueueStatus() {
    const tasks = Array.from(taskQueue.values());
    return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        running: tasks.filter(t => t.status === 'Running').length,
        failed: tasks.filter(t => t.status === 'Failed').length,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// RETRY ENGINE
// Wraps any async task function with retry logic and exponential back-off.
// ─────────────────────────────────────────────────────────────────────────────
async function executeWithRetry(task, handler) {
    while (task.attempts < task.maxAttempts) {
        task.attempts++;
        task.status = 'Running';
        taskQueue.set(task.id, task);
        emit({ type: 'TASK_STARTED', task });
        try {
            const result = await handler(task);
            task.status = 'Success';
            taskQueue.set(task.id, task);
            emit({ type: 'TASK_SUCCESS', task, result });
            // Log success to Supabase
            await supabaseClient_1.supabase.from('ai_logs').insert({
                project_id: task.projectId,
                agent_type: task.agentType,
                action: task.action,
                payload: { attempts: task.attempts, result },
                status: 'Success',
            });
            console.log(`[RetryEngine] Task succeeded: ${task.agentType}::${task.action} (attempt ${task.attempts})`);
            return;
        }
        catch (err) {
            const errMsg = err?.message || String(err);
            console.error(`[RetryEngine] Task failed (attempt ${task.attempts}/${task.maxAttempts}): ${task.agentType}::${task.action} — ${errMsg}`);
            if (task.attempts >= task.maxAttempts) {
                task.status = 'Failed';
                taskQueue.set(task.id, task);
                emit({ type: 'TASK_MAX_RETRIES_EXCEEDED', task });
                // Log final failure to Supabase
                await supabaseClient_1.supabase.from('ai_logs').insert({
                    project_id: task.projectId,
                    agent_type: task.agentType,
                    action: task.action,
                    payload: { attempts: task.attempts, error: errMsg },
                    status: 'Failed',
                });
                // Notify founder that manual intervention is required
                await notifyFounder(task.projectId, `⚠️ AI Agency Alert: Task "${task.action}" for project ${task.projectId} failed after ${task.maxAttempts} attempts. Manual intervention required.`);
                return;
            }
            // Exponential back-off before retry
            task.status = 'Retrying';
            const backoffMs = Math.pow(2, task.attempts) * 1000; // 2s, 4s, 8s...
            task.nextRunAt = new Date(Date.now() + backoffMs).toISOString();
            taskQueue.set(task.id, task);
            emit({ type: 'TASK_RETRYING', task });
            await supabaseClient_1.supabase.from('ai_logs').insert({
                project_id: task.projectId,
                agent_type: task.agentType,
                action: task.action,
                payload: { attempts: task.attempts, error: errMsg, nextRetryAt: task.nextRunAt },
                status: 'Retrying',
            });
            console.log(`[RetryEngine] Retrying in ${backoffMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// COST MONITOR
// Tracks estimated Gemini API token usage per project.
// ─────────────────────────────────────────────────────────────────────────────
const costTracker = new Map();
const GEMINI_COST_PER_1K_TOKENS_USD = 0.000125; // approximate for Gemini 1.5 Flash
function trackCost(projectId, tokensUsed) {
    const current = costTracker.get(projectId) || { totalTokens: 0, estimatedUSDCost: 0 };
    current.totalTokens += tokensUsed;
    current.estimatedUSDCost += (tokensUsed / 1000) * GEMINI_COST_PER_1K_TOKENS_USD;
    costTracker.set(projectId, current);
    console.log(`[CostMonitor] Project ${projectId}: ${current.totalTokens} tokens used (~$${current.estimatedUSDCost.toFixed(4)} USD)`);
}
function getCostReport(projectId) {
    return costTracker.get(projectId) || { totalTokens: 0, estimatedUSDCost: 0 };
}
// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ENGINE
// Sends alerts and updates to the Founder via WhatsApp.
// ─────────────────────────────────────────────────────────────────────────────
const FOUNDER_PHONE = process.env.FOUNDER_PHONE_NUMBER || '';
async function notifyFounder(projectId, message) {
    console.log(`[NotificationEngine] Notifying Founder for project ${projectId}: ${message}`);
    emit({ type: 'NOTIFY_FOUNDER', projectId, message });
    if (!FOUNDER_PHONE) {
        console.warn('[NotificationEngine] FOUNDER_PHONE_NUMBER not set in .env — skipping WhatsApp notification.');
        return;
    }
    try {
        await (0, whatsapp_1.sendTextMessage)(FOUNDER_PHONE, message);
    }
    catch (err) {
        console.error('[NotificationEngine] Failed to send WhatsApp notification:', err);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATOR — PUBLIC API
// Main entry point: enqueues and immediately processes a task.
// ─────────────────────────────────────────────────────────────────────────────
async function runTask(projectId, agentType, action, payload, handler, maxAttempts = 5) {
    const task = enqueueTask(projectId, agentType, action, payload, maxAttempts);
    await executeWithRetry(task, handler);
}
// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROJECT STATE IN SUPABASE
// Helper used by all agents to write their output back to Shared Memory.
// ─────────────────────────────────────────────────────────────────────────────
async function updateProjectState(projectId, stateUpdates) {
    const { data: current, error: fetchError } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    if (fetchError || !current) {
        console.error('[Orchestrator] Could not fetch project state for update:', fetchError);
        return;
    }
    const mergedState = {
        ...current.state_data,
        ...stateUpdates,
        lastUpdated: new Date().toISOString(),
    };
    const { error: updateError } = await supabaseClient_1.supabase
        .from('project_state')
        .update({ state_data: mergedState })
        .eq('project_id', projectId);
    if (updateError) {
        console.error('[Orchestrator] Failed to update project state:', updateError);
    }
    else {
        console.log(`[Orchestrator] Project state updated for project: ${projectId}`);
    }
}
