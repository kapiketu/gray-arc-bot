// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS ANALYST AGENT
// Performs deep research and analysis on the project requirements.
// Outputs: Market analysis, competitor research, feature prioritization,
//          requirements documentation.
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

export interface BusinessAnalysis {
  marketOverview: string;
  targetAudience: {
    primarySegment: string;
    demographics: string;
    painPoints: string[];
    motivations: string[];
  };
  competitorInsights: {
    industryTrends: string[];
    commonFeatures: string[];
    differentiationOpportunities: string[];
  };
  featurePrioritization: {
    mustHave: string[];
    shouldHave: string[];
    niceToHave: string[];
  };
  requirementsDocument: {
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    constraints: string[];
  };
  recommendedTechApproach: string;
}

export async function runBusinessAnalystAgent(projectId: string): Promise<BusinessAnalysis> {
  console.log(`[BusinessAnalystAgent] Starting for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;

  const context = buildSystemContext(
    'Business Analyst Agent — Senior Digital Product Strategist & Market Researcher',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      clientName: req.clientName,
      companyName: req.companyName,
      requirements: req.requirements,
      featuresRequested: req.featuresRequested,
    }
  );

  const prompt = `
${context}

TASK: Perform a thorough business analysis for this ${req.projectType} project.

Return a JSON object matching this EXACT schema:
{
  "marketOverview": "2-3 sentence overview of the market/industry this project operates in",
  "targetAudience": {
    "primarySegment": "who the primary users are",
    "demographics": "age, location, tech-savviness, etc.",
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "motivations": ["motivation 1", "motivation 2"]
  },
  "competitorInsights": {
    "industryTrends": ["trend 1", "trend 2", "trend 3"],
    "commonFeatures": ["feature 1", "feature 2"],
    "differentiationOpportunities": ["opportunity 1", "opportunity 2"]
  },
  "featurePrioritization": {
    "mustHave": ["feature 1", "feature 2"],
    "shouldHave": ["feature 1", "feature 2"],
    "niceToHave": ["feature 1", "feature 2"]
  },
  "requirementsDocument": {
    "functionalRequirements": ["req 1", "req 2", "req 3"],
    "nonFunctionalRequirements": ["performance: ...", "security: ...", "scalability: ..."],
    "constraints": ["constraint 1", "constraint 2"]
  },
  "recommendedTechApproach": "1-2 sentence recommendation on the best technical approach"
}

Return ONLY the JSON object, no other text.
  `.trim();

  const analysis = await runPromptAsJson<BusinessAnalysis>(projectId, prompt);

  await updateProjectState(projectId, { businessAnalysis: analysis });

  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'PM',
    action: 'business_analyst_complete',
    payload: analysis as unknown as Record<string, unknown>,
    status: 'Success',
  });

  console.log(`[BusinessAnalystAgent] Analysis complete for project: ${projectId}`);
  return analysis;
}
