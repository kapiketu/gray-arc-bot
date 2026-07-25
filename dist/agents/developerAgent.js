"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeveloperAgent = runDeveloperAgent;
// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPER AGENT
// Generates the actual working code for the project based on the outputs of
// the Business Analyst, UI/UX, and Architecture agents.
// Outputs: Frontend code, backend routes, database migrations, integrations.
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
const componentAssembler_1 = require("../services/componentAssembler");
const stylingEngine_1 = require("../services/stylingEngine");
async function runDeveloperAgent(projectId) {
    console.log(`[DeveloperAgent] Starting for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const uiuxDesign = state?.uiuxDesign;
    const architecture = state?.architecture;
    const businessAnalysis = state?.businessAnalysis;
    const context = (0, aiBase_1.buildSystemContext)('Developer Agent — Senior Full-Stack Developer (TypeScript, Node.js, React, Supabase)', {
        projectName: req.projectName,
        projectType: req.projectType,
        requirements: req.requirements,
        featuresRequested: req.featuresRequested,
        designSystem: uiuxDesign?.designSystem || {},
        wireframe: uiuxDesign?.wireframe || {},
        techStack: architecture?.techStack || {},
        databaseSchema: architecture?.databaseSchema || [],
        apiStructure: architecture?.apiStructure || [],
        mustHaveFeatures: businessAnalysis?.featurePrioritization?.mustHave || req.featuresRequested,
    });
    const prompt = `
${context}

TASK: Generate the implementation specification for this ${req.projectType} project.

Important rules:
- For a Website: DO NOT generate raw HTML. Instead, generate a structured block schema. Use pre-defined block layouts (e.g. hero_v1, hero_v2, hero_v3, services_v1, services_v2, contact_v1, testimonials_v1) and provide the JSON content.
- For a SaaS or Mobile App: generate the core Fastify route files and React/TypeScript components in 'generatedFiles'.

Return a JSON object matching this EXACT schema:
{
  "implementationSummary": "What was built and key implementation decisions",
  "siteSchema": {
    "layout": ["hero_v3", "services_v2", "contact_v1"],
    "content": {
      "hero_v3": {
        "headline": "...",
        "subheadline": "...",
        "cta_primary": "Explore Services",
        "cta_secondary": "Contact Us"
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
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    if (req.projectType === 'Website' && output.siteSchema) {
        const industry = uiuxDesign?.designSystem?.industryMapping || 'Tech/Startup';
        const tone = uiuxDesign?.designSystem?.detectedTone;
        const theme = (0, stylingEngine_1.getThemeForIndustry)(industry, tone);
        const indexHtml = await (0, componentAssembler_1.assembleBlocks)(output.siteSchema, theme);
        if (!output.generatedFiles)
            output.generatedFiles = [];
        output.generatedFiles.push({
            filePath: 'index.html',
            fileType: 'html',
            content: indexHtml,
            description: 'Main landing page assembled from pre-designed blocks'
        });
    }
    // Save generated files as assets in Supabase
    for (const file of output.generatedFiles) {
        await supabaseClient_1.supabase.from('assets').insert({
            project_id: projectId,
            file_url: `generated://${projectId}/${file.filePath}`,
            asset_type: 'Code',
        });
    }
    await (0, orchestrator_1.updateProjectState)(projectId, {
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
    await supabaseClient_1.supabase.from('ai_logs').insert({
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
