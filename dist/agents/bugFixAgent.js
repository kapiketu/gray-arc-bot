"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBugFixLoop = runBugFixLoop;
// ─────────────────────────────────────────────────────────────────────────────
// BUG FIX AGENT
// Implements the Bug Fix Loop from the flowchart (max 5 attempts).
// Flow:
//   QA FAILED → Bug Fix Agent reads bugs → fixes code → re-runs QA
//   If still failing after MAX_FIX_ATTEMPTS → Notify Founder for manual intervention
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
const qaAgent_1 = require("./qaAgent");
const MAX_FIX_ATTEMPTS = 5;
// ─────────────────────────────────────────────────────────────────────────────
// RUN BUG FIX LOOP
// Entry point: takes a failed QA report and loops until pass or max attempts.
// ─────────────────────────────────────────────────────────────────────────────
async function runBugFixLoop(projectId, initialQaReport) {
    console.log(`[BugFixAgent] Starting bug fix loop for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    let currentQaReport = initialQaReport;
    let attempt = 0;
    const allFixHistory = [];
    while (currentQaReport.overallStatus === 'FAILED' && attempt < MAX_FIX_ATTEMPTS) {
        attempt++;
        console.log(`[BugFixAgent] Fix attempt ${attempt}/${MAX_FIX_ATTEMPTS} for project: ${projectId}`);
        // Notify Founder of retry progress
        if (attempt > 1) {
            await (0, orchestrator_1.notifyFounder)(projectId, `🔄 *Auto Bug Fix — Attempt ${attempt}/${MAX_FIX_ATTEMPTS}*\n\nProject: *${req.projectName}*\nBugs remaining: ${currentQaReport.bugs.length} (${currentQaReport.criticalBugsCount} critical)\nAuto-fixing and re-testing...`);
        }
        try {
            // Run the fix
            const fixResult = await attemptBugFix(projectId, currentQaReport, attempt);
            allFixHistory.push(fixResult);
            // Update state with fix history
            await (0, orchestrator_1.updateProjectState)(projectId, {
                bugFixHistory: allFixHistory,
                currentFixAttempt: attempt,
            });
            // Log attempt to ai_logs
            await supabaseClient_1.supabase.from('ai_logs').insert({
                project_id: projectId,
                agent_type: 'QA',
                action: `bug_fix_attempt_${attempt}`,
                payload: {
                    bugsFixed: fixResult.bugsFixed,
                    filesModified: fixResult.filesModified.map(f => f.filePath),
                    fixSummary: fixResult.fixSummary,
                },
                status: 'Retrying',
            });
            // Re-run QA after fix
            console.log(`[BugFixAgent] Re-running QA after attempt ${attempt}...`);
            currentQaReport = await (0, qaAgent_1.runQaAgent)(projectId);
            if (currentQaReport.overallStatus === 'PASSED') {
                console.log(`[BugFixAgent] ✅ QA passed after ${attempt} fix attempt(s)!`);
                await supabaseClient_1.supabase.from('ai_logs').insert({
                    project_id: projectId,
                    agent_type: 'QA',
                    action: 'bug_fix_loop_resolved',
                    payload: { resolvedAfterAttempts: attempt, finalScore: currentQaReport.qualityScore },
                    status: 'Success',
                });
                return; // Exit loop — QA passed
            }
        }
        catch (err) {
            console.error(`[BugFixAgent] Error during fix attempt ${attempt}:`, err.message);
        }
    }
    // ─── Max Attempts Reached — Still Failing ────────────────────────────────
    if (currentQaReport.overallStatus === 'FAILED') {
        console.error(`[BugFixAgent] ❌ Max attempts (${MAX_FIX_ATTEMPTS}) reached. Still failing. Notifying Founder.`);
        const criticalBugList = currentQaReport.bugs
            .filter(b => b.severity === 'critical' || b.severity === 'high')
            .map(b => `• [${b.severity.toUpperCase()}] ${b.title}`)
            .join('\n');
        await (0, orchestrator_1.notifyFounder)(projectId, `🚨 *Manual Intervention Required*\n\nProject: *${req.projectName}*\n\nThe AI tried ${MAX_FIX_ATTEMPTS} times to fix all bugs but could not fully resolve them.\n\n*Remaining Issues:*\n${criticalBugList || 'See Dashboard for full report'}\n\nQuality Score: ${currentQaReport.qualityScore}/100\n\nPlease review the project in your Dashboard and decide how to proceed.`);
        // Update project status so Founder can see it needs attention
        await supabaseClient_1.supabase.from('projects').update({ status: 'Review' }).eq('id', projectId);
        await supabaseClient_1.supabase.from('ai_logs').insert({
            project_id: projectId,
            agent_type: 'QA',
            action: 'bug_fix_loop_max_attempts_exceeded',
            payload: {
                attemptsUsed: attempt,
                finalScore: currentQaReport.qualityScore,
                remainingBugs: currentQaReport.bugs.length,
            },
            status: 'Failed',
        });
        await (0, orchestrator_1.updateProjectState)(projectId, {
            qaStatus: 'FAILED_MAX_RETRIES',
            requiresManualIntervention: true,
            finalQaReport: currentQaReport,
            bugFixHistory: allFixHistory,
        });
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// ATTEMPT BUG FIX (single attempt)
// Uses Gemini to patch the generated code based on the bug report.
// ─────────────────────────────────────────────────────────────────────────────
async function attemptBugFix(projectId, qaReport, attemptNumber) {
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const developerOutput = state?.developerOutput;
    const generatedFiles = developerOutput?.generatedFiles || [];
    // Focus only on critical and high severity bugs to fix first
    const priorityBugs = qaReport.bugs
        .filter(b => b.severity === 'critical' || b.severity === 'high')
        .slice(0, 5); // Fix max 5 bugs per attempt
    const bugsToFix = priorityBugs.length > 0 ? priorityBugs : qaReport.bugs.slice(0, 3);
    const context = (0, aiBase_1.buildSystemContext)(`Bug Fix Agent — Senior Developer fixing QA issues (Attempt ${attemptNumber}/${MAX_FIX_ATTEMPTS})`, {
        projectId,
        attemptNumber,
        bugsToFix,
        currentFiles: generatedFiles.map((f) => ({
            filePath: f.filePath,
            contentPreview: String(f.content || ''),
        })),
    });
    const prompt = `
${context}

TASK: Fix the following bugs in the generated code. Return the corrected file contents.

Bugs to fix:
${bugsToFix.map(b => `- [${b.id}] [${b.severity.toUpperCase()}] ${b.title}: ${b.description}\n  Suggested Fix: ${b.suggestedFix}\n  File: ${b.affectedFile || 'unknown'}`).join('\n')}

Return a JSON object matching this EXACT schema:
{
  "attemptNumber": ${attemptNumber},
  "bugsFixed": ["BUG-001", "BUG-002"],
  "filesModified": [
    {
      "filePath": "relative/path/to/file.ext",
      "changeDescription": "What was changed and why",
      "updatedContent": "COMPLETE updated file content (not just the diff)"
    }
  ],
  "fixSummary": "2-3 sentence summary of all changes made",
  "remainingIssues": ["Any issues that could not be fixed in this attempt"]
}

Rules:
- updatedContent must be the COMPLETE file, not just the changed lines
- Fix all listed bugs if possible
- Do not break any existing functionality while fixing bugs

Return ONLY the JSON object, no other text.
  `.trim();
    const result = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    // Apply fixes back to developer output in Shared Memory
    const updatedFiles = generatedFiles.map((existingFile) => {
        const fix = result.filesModified.find(f => f.filePath === existingFile.filePath);
        if (fix) {
            return { ...existingFile, content: fix.updatedContent };
        }
        return existingFile;
    });
    // Add any new files created during fix
    for (const fix of result.filesModified) {
        const exists = generatedFiles.some((f) => f.filePath === fix.filePath);
        if (!exists) {
            updatedFiles.push({
                filePath: fix.filePath,
                fileType: 'other',
                content: fix.updatedContent,
                description: `Added during bug fix attempt ${attemptNumber}`,
            });
        }
    }
    await (0, orchestrator_1.updateProjectState)(projectId, {
        developerOutput: {
            ...developerOutput,
            generatedFiles: updatedFiles,
        },
    });
    console.log(`[BugFixAgent] Attempt ${attemptNumber} complete. Fixed: ${result.bugsFixed.join(', ')}`);
    return result;
}
