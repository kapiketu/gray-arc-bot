"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyProjectCreated = notifyProjectCreated;
exports.notifyPhaseComplete = notifyPhaseComplete;
exports.notifyPreviewReady = notifyPreviewReady;
exports.notifyManualInterventionRequired = notifyManualInterventionRequired;
exports.notifyPaymentReminder = notifyPaymentReminder;
exports.notifyChangesRequested = notifyChangesRequested;
exports.notifyProjectApproved = notifyProjectApproved;
// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ENGINE SERVICE
// Dedicated service for all structured Founder and Client notifications.
// Handles:
//   - Project status updates
//   - QA pass/fail alerts
//   - Preview ready messages
//   - Payment reminders
//   - Manual intervention alerts
//   - Phase completion updates
// ─────────────────────────────────────────────────────────────────────────────
const whatsapp_1 = require("./whatsapp");
const supabaseClient_1 = require("../db/supabaseClient");
const FOUNDER_PHONE = process.env.FOUNDER_PHONE_NUMBER || '';
// ─────────────────────────────────────────────────────────────────────────────
// BASE NOTIFY
// ─────────────────────────────────────────────────────────────────────────────
async function sendNotification(projectId, toPhone, message, notificationType) {
    console.log(`[NotificationEngine] [${notificationType}] → ${toPhone}: ${message.substring(0, 80)}...`);
    // Log to ai_logs
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Orchestrator',
        action: `notification_${notificationType}`,
        payload: { toPhone, message, notificationType },
        status: 'Success',
    });
    if (!toPhone) {
        console.warn(`[NotificationEngine] No phone number set for notification: ${notificationType}`);
        return;
    }
    try {
        await (0, whatsapp_1.sendTextMessage)(toPhone, message);
    }
    catch (err) {
        console.error(`[NotificationEngine] Failed to send WhatsApp notification (${notificationType}):`, err.message);
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// 1. PROJECT CREATED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
async function notifyProjectCreated(projectId, projectName, clientName, projectType) {
    const message = `🚀 *New Project Started!*\n\n` +
        `📋 Project: *${projectName}*\n` +
        `👤 Client: ${clientName}\n` +
        `🏗️ Type: ${projectType}\n` +
        `🆔 ID: ${projectId}\n\n` +
        `The AI Agency has started working on this project. You'll be notified at each milestone.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'project_created');
}
// ─────────────────────────────────────────────────────────────────────────────
// 2. PHASE COMPLETE — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
async function notifyPhaseComplete(projectId, projectName, phaseName, nextPhaseName) {
    const message = `✅ *Phase Complete!*\n\n` +
        `📋 Project: *${projectName}*\n` +
        `✅ Completed: ${phaseName}\n` +
        `⏭️ Next: ${nextPhaseName}\n\n` +
        `The AI is continuing automatically.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'phase_complete');
}
// ─────────────────────────────────────────────────────────────────────────────
// 3. PREVIEW READY — Notify Founder with full summary
// ─────────────────────────────────────────────────────────────────────────────
async function notifyPreviewReady(projectId, projectName, qualityScore, testsPassedCount, totalTestsCount, previewUrl) {
    const message = `🎉 *Preview Ready for Review!*\n\n` +
        `📋 Project: *${projectName}*\n` +
        `📊 Quality Score: ${qualityScore}/100\n` +
        `✅ Tests Passed: ${testsPassedCount}/${totalTestsCount}\n` +
        (previewUrl ? `🔗 Preview: ${previewUrl}\n` : '') +
        `\n*Action Required:* Please review the project in your Dashboard and:\n` +
        `• ✅ Approve → Next phase starts\n` +
        `• 🔄 Request Changes → PM creates new tasks\n\n` +
        `💳 *Payment Reminder:* Don't forget to collect the next milestone payment from your client.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'preview_ready');
}
// ─────────────────────────────────────────────────────────────────────────────
// 4. QA FAILED — Manual Intervention Required
// ─────────────────────────────────────────────────────────────────────────────
async function notifyManualInterventionRequired(projectId, projectName, attemptsUsed, remainingBugs, criticalBugs) {
    const message = `🚨 *Manual Intervention Required*\n\n` +
        `📋 Project: *${projectName}*\n` +
        `🔄 Auto-fix Attempts: ${attemptsUsed}/${attemptsUsed}\n` +
        `🐛 Remaining Bugs: ${remainingBugs} (${criticalBugs} critical)\n\n` +
        `The AI could not fully resolve all issues automatically.\n\n` +
        `*Please review the project* in your Dashboard and decide:\n` +
        `• Fix manually\n` +
        `• Adjust requirements\n` +
        `• Close and escalate`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'manual_intervention');
}
// ─────────────────────────────────────────────────────────────────────────────
// 5. PAYMENT REMINDER — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
async function notifyPaymentReminder(projectId, projectName, clientName, milestoneLabel, amount) {
    const message = `💳 *Payment Reminder*\n\n` +
        `📋 Project: *${projectName}*\n` +
        `👤 Client: ${clientName}\n` +
        `🏁 Milestone: ${milestoneLabel}\n` +
        (amount ? `💰 Amount: ${amount}\n` : '') +
        `\nPlease collect payment before proceeding to the next phase.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'payment_reminder');
}
// ─────────────────────────────────────────────────────────────────────────────
// 6. CHANGES REQUESTED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
async function notifyChangesRequested(projectId, projectName, founderNote) {
    const message = `🔄 *Changes Requested*\n\n` +
        `📋 Project: *${projectName}*\n\n` +
        `📝 Note: ${founderNote}\n\n` +
        `The PM Agent is creating new tasks and will restart the affected pipeline stages.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'changes_requested');
}
// ─────────────────────────────────────────────────────────────────────────────
// 7. PROJECT APPROVED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
async function notifyProjectApproved(projectId, projectName) {
    const message = `✅ *Project Approved!*\n\n` +
        `📋 Project: *${projectName}*\n\n` +
        `The project has been marked as approved. The Deployment Agent will now prepare for delivery.`;
    await sendNotification(projectId, FOUNDER_PHONE, message, 'project_approved');
}
