// ─────────────────────────────────────────────────────────────────────────────
// FINAL QA & VALIDATION AGENT
// The last gate before deployment. More rigorous than the mid-project QA.
// Performs a comprehensive final audit covering:
//   - Production readiness check
//   - Security hardening review
//   - Performance benchmarking
//   - Cross-platform compatibility
//   - All client requirements fulfilled check
//   - Final approval score
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

export interface FinalQACheckItem {
  category: string;
  item: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  notes: string;
}

export interface FinalQAReport {
  overallVerdict: 'APPROVED_FOR_DEPLOYMENT' | 'NEEDS_ATTENTION' | 'BLOCKED';
  finalScore: number; // 0-100
  productionReadinessScore: number;
  securityScore: number;
  performanceScore: number;
  clientRequirementsScore: number;
  checklist: FinalQACheckItem[];
  passCount: number;
  warnCount: number;
  failCount: number;
  deploymentBlockers: string[];
  warningsToAddress: string[];
  finalSummary: string;
  signOffNotes: string;
}

export async function runFinalQaAgent(projectId: string): Promise<FinalQAReport> {
  console.log(`[FinalQAAgent] Starting final validation for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const qaReport = state?.qaReport as Record<string, unknown> | undefined;
  const developerOutput = state?.developerOutput as Record<string, unknown> | undefined;
  const contentSeo = state?.contentSeo as Record<string, unknown> | undefined;
  const architecture = state?.architecture as Record<string, unknown> | undefined;
  const generatedFiles = (developerOutput?.generatedFiles as any[]) || [];

  const context = buildSystemContext(
    'Final QA & Validation Agent — Principal QA Lead performing pre-deployment production sign-off',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      featuresRequested: req.featuresRequested,
      requirements: req.requirements,
      midProjectQaScore: (qaReport as any)?.qualityScore || 'N/A',
      midProjectQaBugsFixed: (qaReport as any)?.bugs?.length || 0,
      generatedFilesPaths: generatedFiles.map((f: any) => f.filePath),
      techStack: (architecture as any)?.techStack || {},
      seoPageCount: (contentSeo as any)?.pagesSeoData?.length || 0,
      implementationSummary: developerOutput?.implementationSummary || '',
    }
  );

  const prompt = `
${context}

TASK: Perform a rigorous final pre-deployment validation. This is the LAST quality gate before the project is delivered to the client.

Return a JSON object matching this EXACT schema:
{
  "overallVerdict": "APPROVED_FOR_DEPLOYMENT" | "NEEDS_ATTENTION" | "BLOCKED",
  "finalScore": 0-100,
  "productionReadinessScore": 0-100,
  "securityScore": 0-100,
  "performanceScore": 0-100,
  "clientRequirementsScore": 0-100,
  "checklist": [
    {
      "category": "Security",
      "item": "No hardcoded API keys in frontend code",
      "status": "PASS",
      "notes": "Environment variables correctly used"
    },
    {
      "category": "Performance",
      "item": "Images have proper alt attributes",
      "status": "PASS",
      "notes": "All img tags include descriptive alt text"
    },
    {
      "category": "SEO",
      "item": "Meta descriptions on all pages",
      "status": "PASS",
      "notes": "All pages have unique, correctly-sized meta descriptions"
    },
    {
      "category": "Accessibility",
      "item": "Skip-to-content link present",
      "status": "WARNING",
      "notes": "Recommended for WCAG AA but not blocking"
    },
    {
      "category": "Client Requirements",
      "item": "Contact form present",
      "status": "PASS",
      "notes": "Contact form with validation implemented"
    }
  ],
  "passCount": 0,
  "warnCount": 0,
  "failCount": 0,
  "deploymentBlockers": ["Any FAIL items that must be fixed before deployment"],
  "warningsToAddress": ["Any WARNING items the Founder should note"],
  "finalSummary": "3-4 sentence executive summary of the project's production readiness",
  "signOffNotes": "Final technical sign-off notes for the handover document"
}

Rules:
- overallVerdict is BLOCKED if failCount > 0
- overallVerdict is NEEDS_ATTENTION if warnCount > 2
- overallVerdict is APPROVED_FOR_DEPLOYMENT if failCount === 0 AND warnCount <= 2
- finalScore = average of all 4 sub-scores
- Be thorough but fair — this is a final review, not a first pass
- Check at minimum: Security (3 items), Performance (3), SEO (3), Accessibility (2), Client Requirements (all features)

Return ONLY the JSON object, no other text.
  `.trim();

  const report = await runPromptAsJson<FinalQAReport>(projectId, prompt);

  // Recalculate counts from checklist for accuracy
  report.passCount = report.checklist.filter(c => c.status === 'PASS').length;
  report.warnCount = report.checklist.filter(c => c.status === 'WARNING').length;
  report.failCount = report.checklist.filter(c => c.status === 'FAIL').length;
  report.finalScore = Math.round(
    (report.productionReadinessScore + report.securityScore + report.performanceScore + report.clientRequirementsScore) / 4
  );

  await updateProjectState(projectId, {
    finalQaReport: report,
    productionReady: report.overallVerdict === 'APPROVED_FOR_DEPLOYMENT',
  });

  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'QA',
    action: 'final_qa_complete',
    payload: {
      verdict: report.overallVerdict,
      finalScore: report.finalScore,
      passCount: report.passCount,
      warnCount: report.warnCount,
      failCount: report.failCount,
    },
    status: report.overallVerdict === 'BLOCKED' ? 'Failed' : 'Success',
  });

  console.log(`[FinalQAAgent] Verdict: ${report.overallVerdict} | Score: ${report.finalScore}/100`);
  return report;
}
