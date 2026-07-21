"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDocumentationAgent = runDocumentationAgent;
// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTATION AGENT
// Generates all project documentation for handover. Outputs:
//   - User Manual (for the client)
//   - Technical Documentation (for developers)
//   - Standard Operating Procedures (SOPs)
//   - Admin Guide
//   - Maintenance Guide
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
async function runDocumentationAgent(projectId) {
    console.log(`[DocumentationAgent] Generating project documentation for: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const architecture = state?.architecture;
    const developerOutput = state?.developerOutput;
    const deployment = state?.deployment;
    const contentSeo = state?.contentSeo;
    const projectPlan = state?.projectPlan;
    const context = (0, aiBase_1.buildSystemContext)('Documentation Agent — Senior Technical Writer creating comprehensive project documentation', {
        projectName: req.projectName,
        projectType: req.projectType,
        clientName: req.clientName,
        companyName: req.companyName,
        requirements: req.requirements,
        featuresImplemented: req.featuresRequested,
        techStack: architecture?.techStack || {},
        deploymentPlatform: deployment?.recommendedPlatform || 'Vercel',
        implementationSummary: developerOutput?.implementationSummary || '',
        projectSummary: projectPlan?.projectSummary || '',
        pagesList: contentSeo?.pagesSeoData?.map((p) => p.pageName) || ['Home'],
    });
    const prompt = `
${context}

TASK: Generate comprehensive project documentation for handover.

Return a JSON object matching this EXACT schema:
{
  "userManual": {
    "title": "${req.projectName} — User Guide",
    "introduction": "Welcome paragraph for the client",
    "sections": [
      {
        "title": "Getting Started",
        "content": "Full content of this section"
      },
      {
        "title": "Managing Your Content",
        "content": "How to update content, images, text etc."
      },
      {
        "title": "Understanding Your Dashboard",
        "content": "If applicable — how to use admin panel"
      }
    ],
    "faqs": [
      { "question": "How do I update my website content?", "answer": "Detailed answer" },
      { "question": "How do I add a new page?", "answer": "Detailed answer" },
      { "question": "What do I do if the site goes down?", "answer": "Detailed answer" }
    ],
    "supportContact": "Contact the development team at [founder email/WhatsApp]"
  },
  "technicalDocumentation": {
    "overview": "Technical overview of the project architecture",
    "architecture": "Detailed architecture description",
    "setupGuide": "Step-by-step local development setup",
    "apiReference": [
      { "title": "POST /api/endpoint", "content": "Description, request body, response" }
    ],
    "databaseSchema": "Description of all database tables and relationships",
    "environmentVariables": "All required environment variables with descriptions",
    "troubleshootingGuide": [
      { "title": "Site not loading", "content": "Step by step troubleshooting" },
      { "title": "Form not submitting", "content": "How to debug form issues" }
    ]
  },
  "sops": [
    {
      "sopTitle": "Monthly Content Review",
      "purpose": "Keep website content fresh and accurate",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "frequency": "Monthly"
    },
    {
      "sopTitle": "Weekly Backup Verification",
      "purpose": "Ensure data is being backed up",
      "steps": ["Step 1", "Step 2"],
      "frequency": "Weekly"
    }
  ],
  "maintenanceGuide": {
    "regularTasks": [
      {
        "task": "Update dependencies",
        "frequency": "Monthly",
        "instructions": "Run npm audit and npm update"
      }
    ],
    "backupProcedure": "How to backup the database and files",
    "updateProcedure": "How to deploy updates to production",
    "monitoringChecklist": [
      "Check site uptime daily",
      "Review error logs weekly",
      "Monitor page speed monthly"
    ]
  },
  "documentationSummary": "2-3 sentence summary of all documentation generated"
}

Write real, detailed documentation — not generic placeholders.
Tailor everything to the specific project: ${req.projectName} (${req.projectType}).
Return ONLY the JSON object, no other text.
  `.trim();
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    // Save documentation as an asset
    await supabaseClient_1.supabase.from('assets').insert({
        project_id: projectId,
        file_url: `documentation://${projectId}/complete-documentation`,
        asset_type: 'Document',
    });
    await (0, orchestrator_1.updateProjectState)(projectId, { documentation: output });
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Documentation',
        action: 'documentation_complete',
        payload: {
            userManualSections: output.userManual.sections.length,
            sopsCount: output.sops.length,
            faqsCount: output.userManual.faqs.length,
        },
        status: 'Success',
    });
    console.log(`[DocumentationAgent] Documentation complete. SOPs: ${output.sops.length}, FAQs: ${output.userManual.faqs.length}`);
    return output;
}
