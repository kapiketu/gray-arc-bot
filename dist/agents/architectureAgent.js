"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArchitectureAgent = runArchitectureAgent;
// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE AGENT
// Designs the complete technical architecture of the project.
// Outputs: System architecture, tech stack selection, database schema,
//          API structure, security considerations.
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
async function runArchitectureAgent(projectId) {
    console.log(`[ArchitectureAgent] Starting for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const businessAnalysis = state?.businessAnalysis;
    const context = (0, aiBase_1.buildSystemContext)('Architecture Agent — Senior Software Architect with expertise in scalable web and mobile systems', {
        projectName: req.projectName,
        projectType: req.projectType,
        requirements: req.requirements,
        featuresRequested: req.featuresRequested,
        mustHaveFeatures: businessAnalysis?.featurePrioritization?.mustHave || req.featuresRequested,
        recommendedApproach: businessAnalysis?.recommendedTechApproach || '',
    });
    const prompt = `
${context}

TASK: Design the complete technical architecture for this ${req.projectType} project.

EXISTING INFRASTRUCTURE (already in the codebase — reuse these):
- Backend: Node.js + TypeScript + Fastify
- Database: Supabase (PostgreSQL)
- AI: Google Gemini API (@google/generative-ai)
- Payments: Razorpay
- Messaging: WhatsApp Business Cloud API

Return a JSON object matching this EXACT schema:
{
  "systemOverview": "2-3 sentence overview of the system architecture",
  "architecturePattern": "e.g. MVC, Microservices, Serverless, JAMstack",
  "techStack": {
    "frontend": "e.g. React + Vite / Next.js / Vanilla HTML+CSS+JS",
    "backend": "Node.js + TypeScript + Fastify (existing)",
    "database": "Supabase PostgreSQL (existing)",
    "authentication": "e.g. Supabase Auth / JWT",
    "fileStorage": "e.g. Supabase Storage / Cloudflare R2",
    "deployment": "e.g. Railway / Vercel / Cloudflare Pages",
    "thirdPartyIntegrations": ["WhatsApp Business API", "Razorpay", "Google Gemini"],
    "reasoningNotes": "Why this stack was chosen"
  },
  "databaseSchema": [
    {
      "tableName": "table_name",
      "purpose": "What this table stores",
      "columns": [
        { "name": "id", "type": "UUID", "nullable": false, "description": "Primary key" }
      ]
    }
  ],
  "apiStructure": [
    {
      "method": "POST",
      "path": "/api/resource",
      "description": "What this endpoint does",
      "requestBody": "{ field: type }",
      "responseShape": "{ success: boolean, data: {} }",
      "authRequired": true
    }
  ],
  "securityConsiderations": ["consideration 1", "consideration 2"],
  "scalabilityNotes": "How the system scales",
  "folderStructure": {
    "src/agents": "AI agent modules",
    "src/routes": "Fastify route handlers",
    "src/services": "Business logic services"
  },
  "environmentVariables": [
    { "key": "SUPABASE_URL", "description": "Supabase project URL", "required": true }
  ]
}

Return ONLY the JSON object, no other text.
  `.trim();
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    await (0, orchestrator_1.updateProjectState)(projectId, { architecture: output });
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Architecture',
        action: 'architecture_design_complete',
        payload: output,
        status: 'Success',
    });
    console.log(`[ArchitectureAgent] Architecture design complete for project: ${projectId}`);
    return output;
}
