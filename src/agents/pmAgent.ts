// ─────────────────────────────────────────────────────────────────────────────
// PROJECT MANAGER AGENT
// The Business Brain of the project. First agent to run after Input Normalizer.
// Responsibilities:
//   1. Analyze requirements & understand client goals
//   2. Create a detailed Project Plan & Roadmap
//   3. Define dynamic Phases & Milestones
//   4. Select the required AI agents for this specific project
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState, runTask } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest, AgentType } from '../types/agent.types';
import { runBusinessAnalystAgent } from './businessAnalystAgent';
import { runUiuxAgent } from './uiuxAgent';
import { runArchitectureAgent } from './architectureAgent';
import { runDeveloperAgent } from './developerAgent';
import { runContentSeoAgent } from './contentSeoAgent';
import { runQaAgent } from './qaAgent';
import { runBugFixLoop } from './bugFixAgent';
import { notifyProjectCreated, notifyPreviewReady } from '../services/notificationEngine';

// ─────────────────────────────────────────────────────────────────────────────
// PM AGENT OUTPUT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export interface ProjectPlan {
  projectSummary: string;
  clientGoals: string[];
  successCriteria: string[];
  phases: ProjectPhase[];
  selectedAgents: AgentType[];
  estimatedDuration: string;
  riskFactors: string[];
  assumptions: string[];
}

export interface ProjectPhase {
  phaseNumber: number;
  phaseName: string;
  description: string;
  milestones: string[];
  assignedAgents: AgentType[];
  estimatedDays: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN PM AGENT
// ─────────────────────────────────────────────────────────────────────────────
export async function runPmAgent(projectId: string): Promise<ProjectPlan> {
  console.log(`[PMAgent] Starting for project: ${projectId}`);

  // Fetch current project state from Shared Memory
  const { data: stateRow, error } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  if (error || !stateRow) {
    throw new Error(`[PMAgent] Cannot read project state for: ${projectId}`);
  }

  const state = stateRow.state_data as Record<string, unknown>;
  const normalizedRequest = state.normalizedRequest as NormalizedRequest;

  const systemContext = buildSystemContext(
    'Project Manager Agent — Senior Digital Agency Project Manager with 15 years experience',
    {
      projectId,
      projectName: normalizedRequest.projectName,
      projectType: normalizedRequest.projectType,
      clientName: normalizedRequest.clientName,
      requirements: normalizedRequest.requirements,
      featuresRequested: normalizedRequest.featuresRequested,
      referenceUrls: normalizedRequest.referenceUrls || [],
      changeRequests: state.changeRequests || [],
    }
  );

  const prompt = `
${systemContext}

TASK: Analyze the project requirements above and create a comprehensive project plan.

Return a JSON object matching this EXACT schema:
{
  "projectSummary": "2-3 sentence summary of the project",
  "clientGoals": ["goal 1", "goal 2", "goal 3"],
  "successCriteria": ["criterion 1", "criterion 2"],
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Phase name",
      "description": "What this phase accomplishes",
      "milestones": ["milestone 1", "milestone 2"],
      "assignedAgents": ["PM", "BusinessAnalyst"],
      "estimatedDays": 2
    }
  ],
  "selectedAgents": ["PM", "BusinessAnalyst", "UIUX", "Architecture", "Developer", "Content", "QA"],
  "estimatedDuration": "X weeks",
  "riskFactors": ["risk 1", "risk 2"],
  "assumptions": ["assumption 1", "assumption 2"]
}

Rules:
- selectedAgents must only include agents from: ["PM", "BusinessAnalyst", "UIUX", "Architecture", "Developer", "Content", "QA", "Deployment", "Documentation"]
- phases should be realistic for the project type: ${normalizedRequest.projectType}
- Always include at least 3 phases: Discovery, Development, Delivery
- Return ONLY the JSON object, no other text.
  `.trim();

  const plan = await runPromptAsJson<ProjectPlan>(projectId, prompt);

  // Write plan to Shared Project Memory
  await updateProjectState(projectId, {
    projectPlan: plan,
    currentPhase: plan.phases[0]?.phaseName || 'Discovery',
    selectedAgents: plan.selectedAgents,
    phases: plan.phases,
    milestones: plan.phases.flatMap(p => p.milestones),
  });

  // Update project status to Planning
  await supabase
    .from('projects')
    .update({ status: 'Planning' })
    .eq('id', projectId);

  // Log to ai_logs
  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'PM',
    action: 'create_project_plan',
    payload: plan as unknown as Record<string, unknown>,
    status: 'Success',
  });

  console.log(`[PMAgent] Project plan created. Phases: ${plan.phases.length}, Agents: ${plan.selectedAgents.join(', ')}`);

  // Trigger execution phase — run analyst, UX, architecture in parallel, then developer, then content
  await triggerExecutionPipeline(projectId, plan);

  return plan;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER EXECUTION PIPELINE
// Fires the agent pipeline based on the PM's plan.
// ─────────────────────────────────────────────────────────────────────────────
async function triggerExecutionPipeline(projectId: string, plan: ProjectPlan): Promise<void> {
  console.log(`[PMAgent] Triggering execution pipeline for project: ${projectId}`);

  // Update status to Execution
  await supabase.from('projects').update({ status: 'Execution' }).eq('id', projectId);

  // Run Business Analyst, UI/UX, and Architecture agents SEQUENTIALLY to prevent rate limit (429) errors on free tier
  if (plan.selectedAgents.includes('BusinessAnalyst' as AgentType)) {
    await runTask(projectId, 'PM', 'trigger_business_analyst', {}, async () => {
      await runBusinessAnalystAgent(projectId);
    });
  }

  if (plan.selectedAgents.includes('UIUX')) {
    await runTask(projectId, 'PM', 'trigger_uiux', {}, async () => {
      await runUiuxAgent(projectId);
    });
  }

  if (plan.selectedAgents.includes('Architecture')) {
    await runTask(projectId, 'PM', 'trigger_architecture', {}, async () => {
      await runArchitectureAgent(projectId);
    });
  }

  console.log(`[PMAgent] Initial agents complete. Running Developer Agent...`);

  // Run Developer Agent after the parallel agents finish
  if (plan.selectedAgents.includes('Developer')) {
    await runTask(projectId, 'PM', 'trigger_developer', {}, async () => {
      await runDeveloperAgent(projectId);
    });
  }

  // Run Content/SEO Agent last
  if (plan.selectedAgents.includes('Content')) {
    await runTask(projectId, 'PM', 'trigger_content_seo', {}, async () => {
      await runContentSeoAgent(projectId);
    });
  }

  // Update status to QA and run the QA + Bug Fix pipeline
  await supabase.from('projects').update({ status: 'QA' }).eq('id', projectId);

  // Fetch normalizedRequest from Shared Memory for notification context
  const { data: stateForNotify } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();
  const stateData = stateForNotify?.state_data as Record<string, unknown>;
  const req = stateData?.normalizedRequest as NormalizedRequest | undefined;

  // Notify Founder that AI work is complete and QA is starting
  await notifyProjectCreated(
    projectId,
    req?.projectName || projectId,
    req?.clientName || 'Client',
    req?.projectType || 'Website'
  );

  // Run QA Agent
  await runTask(projectId, 'QA', 'run_qa_agent', {}, async () => {
    const qaReport = await runQaAgent(projectId);

    if (qaReport.overallStatus === 'FAILED') {
      // Activate Bug Fix Loop (max 5 attempts)
      await runBugFixLoop(projectId, qaReport);
    } else {
      // QA Passed immediately — notify Founder preview is ready
      await notifyPreviewReady(
        projectId,
        req?.projectName || projectId,
        qaReport.qualityScore,
        qaReport.passedTestsCount,
        qaReport.totalTestsCount
      );
    }
    return qaReport;
  });

  console.log(`[PMAgent] Full pipeline complete. Project ${projectId} moved to Review.`);
}
