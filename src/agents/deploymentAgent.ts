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
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

export interface DeploymentFile {
  filePath: string;
  content: string;
  description: string;
}

export interface DeploymentPlatform {
  name: string;
  url: string;
  estimatedCostPerMonth: string;
  pros: string[];
  cons: string[];
  recommendedFor: string;
}

export interface DeploymentOutput {
  recommendedPlatform: string;
  alternativePlatforms: DeploymentPlatform[];
  deploymentFiles: DeploymentFile[];
  stepByStepInstructions: Array<{
    step: number;
    title: string;
    command?: string;
    description: string;
    estimatedTime: string;
  }>;
  environmentVariablesTemplate: Array<{
    key: string;
    value: string;
    description: string;
    isSecret: boolean;
  }>;
  domainSetupInstructions: string[];
  postDeploymentChecklist: string[];
  estimatedDeploymentTime: string;
  deploymentSummary: string;
}

export async function runDeploymentAgent(projectId: string): Promise<DeploymentOutput> {
  console.log(`[DeploymentAgent] Generating deployment configuration for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const architecture = state?.architecture as Record<string, unknown> | undefined;
  const developerOutput = state?.developerOutput as Record<string, unknown> | undefined;
  const finalQa = state?.finalQaReport as Record<string, unknown> | undefined;

  const context = buildSystemContext(
    'Deployment Agent — Senior DevOps Engineer specializing in web application deployment and CI/CD',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      techStack: (architecture as any)?.techStack || {},
      generatedFiles: (developerOutput?.filesGenerated as string[]) || [],
      implementationSummary: developerOutput?.implementationSummary || '',
      finalQaVerdict: (finalQa as any)?.overallVerdict || 'APPROVED_FOR_DEPLOYMENT',
      existingInfrastructure: {
        backend: 'Node.js + TypeScript + Fastify',
        database: 'Supabase (PostgreSQL)',
        currentStack: 'Already running on port 3000 with cloudflared tunnel',
      },
    }
  );

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

  const output = await runPromptAsJson<DeploymentOutput>(projectId, prompt);

  // Save deployment files as assets
  for (const file of output.deploymentFiles) {
    await supabase.from('assets').insert({
      project_id: projectId,
      file_url: `deployment://${projectId}/${file.filePath}`,
      asset_type: 'Document',
    });
  }

  await updateProjectState(projectId, {
    deployment: {
      recommendedPlatform: output.recommendedPlatform,
      deploymentFiles: output.deploymentFiles,
      stepByStepInstructions: output.stepByStepInstructions,
      environmentVariablesTemplate: output.environmentVariablesTemplate,
      postDeploymentChecklist: output.postDeploymentChecklist,
      deploymentSummary: output.deploymentSummary,
    },
  });

  await supabase.from('ai_logs').insert({
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
