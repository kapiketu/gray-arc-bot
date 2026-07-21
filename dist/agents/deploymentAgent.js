"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDeploymentAgent = runDeploymentAgent;
// ─────────────────────────────────────────────────────────────────────────────
// DEPLOYMENT AGENT
// Generates all deployment configuration files and step-by-step instructions
// to take the generated code to production. Supports multiple platforms:
//   - Vercel (static sites / Next.js)
//   - Railway (Node.js / Fastify backends)
//   - Netlify (static sites)
//   - Cloudflare Pages (static sites)
//   - VPS / cPanel (shared hosting)
// Also creates environment variable templates and CI/CD pipeline configs.
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
async function runDeploymentAgent(projectId) {
    console.log(`[DeploymentAgent] Generating deployment configuration for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const architecture = state?.architecture;
    const developerOutput = state?.developerOutput;
    const finalQa = state?.finalQaReport;
    const context = (0, aiBase_1.buildSystemContext)('Deployment Agent — Senior DevOps Engineer specializing in web application deployment and CI/CD', {
        projectName: req.projectName,
        projectType: req.projectType,
        techStack: architecture?.techStack || {},
        generatedFiles: developerOutput?.filesGenerated || [],
        implementationSummary: developerOutput?.implementationSummary || '',
        finalQaVerdict: finalQa?.overallVerdict || 'APPROVED_FOR_DEPLOYMENT',
        existingInfrastructure: {
            backend: 'Node.js + TypeScript + Fastify',
            database: 'Supabase (PostgreSQL)',
            currentStack: 'Already running on port 3000 with cloudflared tunnel',
        },
    });
    const prompt = `
${context}

TASK: Generate complete deployment configuration and instructions for this ${req.projectType} project.

The project already has an existing Node.js + Fastify backend. The generated output is primarily a ${req.projectType}.

Return a JSON object matching this EXACT schema:
{
  "recommendedPlatform": "Platform name (e.g., Vercel, Railway, Netlify)",
  "alternativePlatforms": [
    {
      "name": "Platform name",
      "url": "https://platform.com",
      "estimatedCostPerMonth": "$0 - $20",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1"],
      "recommendedFor": "When to choose this platform"
    }
  ],
  "deploymentFiles": [
    {
      "filePath": "vercel.json",
      "content": "{ complete file content as string }",
      "description": "Vercel deployment configuration"
    },
    {
      "filePath": ".github/workflows/deploy.yml",
      "content": "complete GitHub Actions CI/CD workflow content",
      "description": "GitHub Actions deployment pipeline"
    },
    {
      "filePath": ".env.production.example",
      "content": "KEY=value\\nANOTHER_KEY=value",
      "description": "Production environment variables template"
    }
  ],
  "stepByStepInstructions": [
    {
      "step": 1,
      "title": "Install Vercel CLI",
      "command": "npm install -g vercel",
      "description": "Install the Vercel CLI tool globally",
      "estimatedTime": "1 minute"
    }
  ],
  "environmentVariablesTemplate": [
    {
      "key": "SUPABASE_URL",
      "value": "https://your-project.supabase.co",
      "description": "Your Supabase project URL",
      "isSecret": false
    },
    {
      "key": "SUPABASE_SERVICE_ROLE_KEY",
      "value": "your_service_role_key",
      "description": "Supabase service role key — keep secret!",
      "isSecret": true
    }
  ],
  "domainSetupInstructions": [
    "Step 1: Purchase domain from GoDaddy or Namecheap",
    "Step 2: Add CNAME record pointing to deployment URL"
  ],
  "postDeploymentChecklist": [
    "Verify site loads at production URL",
    "Test all forms and interactive elements",
    "Check Google PageSpeed score > 90"
  ],
  "estimatedDeploymentTime": "15-30 minutes",
  "deploymentSummary": "2-3 sentence summary of the deployment approach"
}

Generate REAL, complete deployment files — not placeholders.
Include a GitHub Actions workflow for CI/CD.
Return ONLY the JSON object, no other text.
  `.trim();
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    // Save deployment files as assets
    for (const file of output.deploymentFiles) {
        await supabaseClient_1.supabase.from('assets').insert({
            project_id: projectId,
            file_url: `deployment://${projectId}/${file.filePath}`,
            asset_type: 'Document',
        });
    }
    await (0, orchestrator_1.updateProjectState)(projectId, {
        deployment: {
            recommendedPlatform: output.recommendedPlatform,
            deploymentFiles: output.deploymentFiles,
            stepByStepInstructions: output.stepByStepInstructions,
            environmentVariablesTemplate: output.environmentVariablesTemplate,
            postDeploymentChecklist: output.postDeploymentChecklist,
            deploymentSummary: output.deploymentSummary,
        },
    });
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Deployment',
        action: 'deployment_config_generated',
        payload: {
            platform: output.recommendedPlatform,
            filesGenerated: output.deploymentFiles.map(f => f.filePath),
            stepsCount: output.stepByStepInstructions.length,
        },
        status: 'Success',
    });
    console.log(`[DeploymentAgent] Deployment config ready. Platform: ${output.recommendedPlatform}, Files: ${output.deploymentFiles.length}`);
    return output;
}
