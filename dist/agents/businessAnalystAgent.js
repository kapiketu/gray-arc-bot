"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBusinessAnalystAgent = runBusinessAnalystAgent;
// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS ANALYST AGENT
// Performs deep research and analysis on the project requirements.
// Outputs: Market analysis, competitor research, feature prioritization,
//          requirements documentation.
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
async function runBusinessAnalystAgent(projectId) {
    console.log(`[BusinessAnalystAgent] Starting for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const context = (0, aiBase_1.buildSystemContext)('Business Analyst Agent — Senior Digital Product Strategist & Market Researcher', {
        projectName: req.projectName,
        projectType: req.projectType,
        clientName: req.clientName,
        companyName: req.companyName,
        requirements: req.requirements,
        featuresRequested: req.featuresRequested,
    });
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
    const analysis = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    await (0, orchestrator_1.updateProjectState)(projectId, { businessAnalysis: analysis });
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'PM',
        action: 'business_analyst_complete',
        payload: analysis,
        status: 'Success',
    });
    console.log(`[BusinessAnalystAgent] Analysis complete for project: ${projectId}`);
    return analysis;
}
