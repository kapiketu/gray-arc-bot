"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeliveryPipeline = runDeliveryPipeline;
// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY PIPELINE SERVICE
// Orchestrates the full Phase 5 delivery pipeline:
//   Final QA → Deployment Agent → Documentation Agent → Handover Agent → CLOSED
// Triggered when Founder marks project as Approved.
// ─────────────────────────────────────────────────────────────────────────────
const orchestrator_1 = require("./orchestrator");
const finalQaAgent_1 = require("../agents/finalQaAgent");
const deploymentAgent_1 = require("../agents/deploymentAgent");
const documentationAgent_1 = require("../agents/documentationAgent");
const handoverAgent_1 = require("../agents/handoverAgent");
const supabaseClient_1 = require("../db/supabaseClient");
const orchestrator_2 = require("./orchestrator");
async function runDeliveryPipeline(projectId) {
    console.log(`[DeliveryPipeline] Starting Phase 5 delivery for project: ${projectId}`);
    // Step 1: Final QA & Validation
    await (0, orchestrator_1.runTask)(projectId, 'QA', 'final_qa_validation', {}, async () => {
        const finalQaReport = await (0, finalQaAgent_1.runFinalQaAgent)(projectId);
        if (finalQaReport.overallVerdict === 'BLOCKED') {
            await (0, orchestrator_2.notifyFounder)(projectId, `🚨 *Final QA BLOCKED*\n\nProject cannot be deployed.\n\nBlockers:\n${finalQaReport.deploymentBlockers.map(b => `• ${b}`).join('\n')}\n\nPlease review and fix before reapproving.`);
            throw new Error(`Final QA blocked deployment. Blockers: ${finalQaReport.deploymentBlockers.join(', ')}`);
        }
        if (finalQaReport.overallVerdict === 'NEEDS_ATTENTION') {
            await (0, orchestrator_2.notifyFounder)(projectId, `⚠️ *Final QA: Needs Attention*\n\nProject passed but has ${finalQaReport.warnCount} warnings.\nScore: ${finalQaReport.finalScore}/100\n\nWarnings:\n${finalQaReport.warningsToAddress.slice(0, 3).map(w => `• ${w}`).join('\n')}\n\nProceeding to deployment...`);
        }
        return finalQaReport;
    });
    // Step 2: Deployment Agent
    await (0, orchestrator_1.runTask)(projectId, 'Deployment', 'generate_deployment_config', {}, async () => {
        const deploymentOutput = await (0, deploymentAgent_1.runDeploymentAgent)(projectId);
        await (0, orchestrator_2.notifyFounder)(projectId, `🚀 *Deployment Config Ready*\n\nPlatform: ${deploymentOutput.recommendedPlatform}\nFiles generated: ${deploymentOutput.deploymentFiles.length}\n\nFollow the deployment steps in your Dashboard.`);
        return deploymentOutput;
    });
    // Step 3: Documentation Agent
    await (0, orchestrator_1.runTask)(projectId, 'Documentation', 'generate_documentation', {}, async () => {
        const docs = await (0, documentationAgent_1.runDocumentationAgent)(projectId);
        return docs;
    });
    // Step 4: Handover Agent — compiles everything and closes the project
    await (0, orchestrator_1.runTask)(projectId, 'Documentation', 'client_handover', {}, async () => {
        const handover = await (0, handoverAgent_1.runHandoverAgent)(projectId);
        return handover;
    });
    // Update dashboard status
    await supabaseClient_1.supabase.from('projects').update({ status: 'Completed' }).eq('id', projectId);
    console.log(`[DeliveryPipeline] ✅ PROJECT CLOSED: ${projectId}`);
}
