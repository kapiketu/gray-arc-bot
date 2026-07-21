// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPER AGENT
// Generates the actual working code for the project based on the outputs of
// the Business Analyst, UI/UX, and Architecture agents.
// Outputs: Frontend code, backend routes, database migrations, integrations.
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';
import { assembleBlocks } from '../services/componentAssembler';
import { getThemeForIndustry } from '../services/stylingEngine';

export interface GeneratedFile {
  filePath: string;
  fileType: 'html' | 'css' | 'typescript' | 'javascript' | 'sql' | 'json' | 'markdown' | 'other';
  content: string;
  description: string;
}

export interface DeveloperOutput {
  implementationSummary: string;
  siteSchema?: {
    theme_override?: {
      dominant_color_type?: string;
    };
    layout: string[];
    content: Record<string, any>;
  };
  generatedFiles: GeneratedFile[];
  setupInstructions: string[];
  dependenciesToInstall: string[];
  postSetupChecklist: string[];
  knownLimitations: string[];
}

export async function runDeveloperAgent(projectId: string): Promise<DeveloperOutput> {
  console.log(`[DeveloperAgent] Starting for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const uiuxDesign = state?.uiuxDesign as Record<string, unknown> | undefined;
  const architecture = state?.architecture as Record<string, unknown> | undefined;
  const businessAnalysis = state?.businessAnalysis as Record<string, unknown> | undefined;

  const context = buildSystemContext(
    'Developer Agent — Senior Full-Stack Developer (TypeScript, Node.js, React, Supabase)',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      requirements: req.requirements,
      featuresRequested: req.featuresRequested,
      designSystem: (uiuxDesign as any)?.designSystem || {},
      wireframe: (uiuxDesign as any)?.wireframe || {},
      techStack: (architecture as any)?.techStack || {},
      databaseSchema: (architecture as any)?.databaseSchema || [],
      apiStructure: (architecture as any)?.apiStructure || [],
      mustHaveFeatures: (businessAnalysis?.featurePrioritization as any)?.mustHave || req.featuresRequested,
    }
  );

  const prompt = `
${context}

TASK: Generate the implementation specification for this ${req.projectType} project.

Important rules:
- For a Website: DO NOT generate raw HTML. Instead, generate a structured block schema. Use pre-defined block layouts (e.g. hero_v1, hero_v2, services_v1, services_v2, contact_v1, testimonials_v1) and provide the JSON content.
- For a SaaS or Mobile App: generate the core Fastify route files and React/TypeScript components in 'generatedFiles'.

Return a JSON object matching this EXACT schema:
{
  "implementationSummary": "What was built and key implementation decisions",
  "siteSchema": {
    "layout": ["hero_v1", "services_v2", "contact_v1"],
    "content": {
      "hero_v1": {
        "headline": "...",
        "subheadline": "...",
        "cta_text": "..."
      },
      "services_v2": {
        "section_title": "...",
        "section_subtitle": "...",
        "items": [
          {"title": "...", "desc": "...", "icon": "..."}
        ]
      },
      "contact_v1": {
        "section_title": "...",
        "phone": "...",
        "email": "..."
      }
    }
  },
  "generatedFiles": [
    {
      "filePath": "relative/path/to/file.ext",
      "fileType": "typescript",
      "content": "FULL file content as a string",
      "description": "What this file does"
    }
  ],
  "setupInstructions": ["Step 1", "Step 2"],
  "dependenciesToInstall": ["package-name@version"],
  "postSetupChecklist": ["item 1", "item 2"],
  "knownLimitations": ["limitation 1"]
}

Return ONLY the JSON object, no other text.
  `.trim();

  const output = await runPromptAsJson<DeveloperOutput>(projectId, prompt);

  if (req.projectType === 'Website' && output.siteSchema) {
    const industry = (uiuxDesign as any)?.designSystem?.industryMapping || 'Tech/Startup';
    const tone = (uiuxDesign as any)?.designSystem?.detectedTone;
    const theme = getThemeForIndustry(industry, tone);
    
    const indexHtml = await assembleBlocks(output.siteSchema, theme);
    
    if (!output.generatedFiles) output.generatedFiles = [];
    output.generatedFiles.push({
      filePath: 'index.html',
      fileType: 'html',
      content: indexHtml,
      description: 'Main landing page assembled from pre-designed blocks'
    });
  }

  // Save generated files as assets in Supabase
  for (const file of output.generatedFiles) {
    await supabase.from('assets').insert({
      project_id: projectId,
      file_url: `generated://${projectId}/${file.filePath}`,
      asset_type: 'Code',
    });
  }

  await updateProjectState(projectId, {
    developerOutput: {
      implementationSummary: output.implementationSummary,
      filesGenerated: output.generatedFiles.map(f => f.filePath),
      setupInstructions: output.setupInstructions,
      dependenciesToInstall: output.dependenciesToInstall,
      postSetupChecklist: output.postSetupChecklist,
      knownLimitations: output.knownLimitations,
      // Store file contents in state for retrieval
      generatedFiles: output.generatedFiles,
    },
  });

  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'Developer',
    action: 'code_generation_complete',
    payload: {
      filesGenerated: output.generatedFiles.map(f => ({ path: f.filePath, type: f.fileType })),
      summary: output.implementationSummary,
    },
    status: 'Success',
  });

  console.log(`[DeveloperAgent] Generated ${output.generatedFiles.length} files for project: ${projectId}`);
  return output;
}
