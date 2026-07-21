// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE AGENT
// Designs the complete technical architecture of the project.
// Outputs: System architecture, tech stack selection, database schema,
//          API structure, security considerations.
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  authentication: string;
  fileStorage: string;
  deployment: string;
  thirdPartyIntegrations: string[];
  reasoningNotes: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseShape?: string;
  authRequired: boolean;
}

export interface DatabaseTable {
  tableName: string;
  purpose: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    description: string;
  }>;
}

export interface ArchitectureOutput {
  systemOverview: string;
  architecturePattern: string;
  techStack: TechStack;
  databaseSchema: DatabaseTable[];
  apiStructure: ApiEndpoint[];
  securityConsiderations: string[];
  scalabilityNotes: string;
  folderStructure: Record<string, string>;
  environmentVariables: Array<{ key: string; description: string; required: boolean }>;
}

export async function runArchitectureAgent(projectId: string): Promise<ArchitectureOutput> {
  console.log(`[ArchitectureAgent] Starting for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const businessAnalysis = state?.businessAnalysis as Record<string, unknown> | undefined;

  const context = buildSystemContext(
    'Architecture Agent — Senior Software Architect with expertise in scalable web and mobile systems',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      requirements: req.requirements,
      featuresRequested: req.featuresRequested,
      mustHaveFeatures: (businessAnalysis?.featurePrioritization as any)?.mustHave || req.featuresRequested,
      recommendedApproach: businessAnalysis?.recommendedTechApproach || '',
    }
  );

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

  const output = await runPromptAsJson<ArchitectureOutput>(projectId, prompt);

  await updateProjectState(projectId, { architecture: output });

  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'Architecture',
    action: 'architecture_design_complete',
    payload: output as unknown as Record<string, unknown>,
    status: 'Success',
  });

  console.log(`[ArchitectureAgent] Architecture design complete for project: ${projectId}`);
  return output;
}
