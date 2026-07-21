// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY PIPELINE SERVICE
// Orchestrates the full Phase 5 delivery pipeline:
//   Final QA → Deployment Agent → Documentation Agent → Handover Agent → CLOSED
// Triggered when Founder marks project as Approved.
// ─────────────────────────────────────────────────────────────────────────────
import { runTask } from './orchestrator';
import { runFinalQaAgent } from '../agents/finalQaAgent';
import { runDeploymentAgent } from '../agents/deploymentAgent';
import { runDocumentationAgent } from '../agents/documentationAgent';
import { runHandoverAgent } from '../agents/handoverAgent';
import { supabase } from '../db/supabaseClient';
import { notifyFounder } from './orchestrator';

export async function runDeliveryPipeline(projectId: string): Promise<void> {
  console.log(`[DeliveryPipeline] Starting Phase 5 delivery for project: ${projectId}`);

  // Step 1: Final QA & Validation
  await runTask(projectId, 'QA', 'final_qa_validation', {}, async () => {
    const finalQaReport = await runFinalQaAgent(projectId);

    if (finalQaReport.overallVerdict === 'BLOCKED') {
      await notifyFounder(
        projectId,
        `🚨 *Final QA BLOCKED*\n\nProject cannot be deployed.\n\nBlockers:\n${finalQaReport.deploymentBlockers.map(b => `• ${b}`).join('\n')}\n\nPlease review and fix before reapproving.`
      );
      throw new Error(`Final QA blocked deployment. Blockers: ${finalQaReport.deploymentBlockers.join(', ')}`);
    }

    if (finalQaReport.overallVerdict === 'NEEDS_ATTENTION') {
      await notifyFounder(
        projectId,
        `⚠️ *Final QA: Needs Attention*\n\nProject passed but has ${finalQaReport.warnCount} warnings.\nScore: ${finalQaReport.finalScore}/100\n\nWarnings:\n${finalQaReport.warningsToAddress.slice(0, 3).map(w => `• ${w}`).join('\n')}\n\nProceeding to deployment...`
      );
    }

    return finalQaReport;
  });

  // Step 2: Deployment Agent
  await runTask(projectId, 'Deployment', 'generate_deployment_config', {}, async () => {
    const deploymentOutput = await runDeploymentAgent(projectId);
    await notifyFounder(
      projectId,
      `🚀 *Deployment Config Ready*\n\nPlatform: ${deploymentOutput.recommendedPlatform}\nFiles generated: ${deploymentOutput.deploymentFiles.length}\n\nFollow the deployment steps in your Dashboard.`
    );
    return deploymentOutput;
  });

  // Step 3: Documentation Agent
  await runTask(projectId, 'Documentation', 'generate_documentation', {}, async () => {
    const docs = await runDocumentationAgent(projectId);
    return docs;
  });

  // Step 4: Handover Agent — compiles everything and closes the project
  await runTask(projectId, 'Documentation', 'client_handover', {}, async () => {
    const handover = await runHandoverAgent(projectId);
    return handover;
  });

  // Update dashboard status
  await supabase.from('projects').update({ status: 'Completed' }).eq('id', projectId);
  console.log(`[DeliveryPipeline] ✅ PROJECT CLOSED: ${projectId}`);
}
