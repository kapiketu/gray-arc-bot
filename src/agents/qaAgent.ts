// ─────────────────────────────────────────────────────────────────────────────
// QA / TESTING AGENT
// Reviews all generated code outputs and produces a quality report with:
//   - Functional testing (features work as specified)
//   - Responsive design checks (mobile/tablet/desktop)
//   - SEO validation
//   - Accessibility checks
//   - Cross-browser compatibility notes
//   - Security review
//   - Performance recommendations
// Returns a pass/fail verdict with a list of bugs to fix.
// ─────────────────────────────────────────────────────────────────────────────
import { runPromptAsJson, buildSystemContext } from './aiBase';
import { updateProjectState, notifyFounder } from '../services/orchestrator';
import { supabase } from '../db/supabaseClient';
import { NormalizedRequest } from '../types/agent.types';

// ─────────────────────────────────────────────────────────────────────────────
// QA OUTPUT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export type QASeverity = 'critical' | 'high' | 'medium' | 'low';

export interface QABug {
  id: string;
  severity: QASeverity;
  category: 'functional' | 'responsive' | 'seo' | 'accessibility' | 'security' | 'performance' | 'content';
  title: string;
  description: string;
  affectedFile?: string;
  suggestedFix: string;
}

export interface QATestResult {
  testName: string;
  passed: boolean;
  notes: string;
}

export interface QAReport {
  overallStatus: 'PASSED' | 'FAILED';
  qualityScore: number; // 0–100
  testResults: QATestResult[];
  bugs: QABug[];
  criticalBugsCount: number;
  highBugsCount: number;
  passedTestsCount: number;
  totalTestsCount: number;
  recommendations: string[];
  readyForFounderReview: boolean;
  qaSummary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN QA AGENT
// ─────────────────────────────────────────────────────────────────────────────
export async function runQaAgent(projectId: string): Promise<QAReport> {
  console.log(`[QAAgent] Starting QA review for project: ${projectId}`);

  const { data: stateRow } = await supabase
    .from('project_state')
    .select('state_data')
    .eq('project_id', projectId)
    .single();

  const state = stateRow?.state_data as Record<string, unknown>;
  const req = state?.normalizedRequest as NormalizedRequest;
  const developerOutput = state?.developerOutput as Record<string, unknown> | undefined;
  const uiuxDesign = state?.uiuxDesign as Record<string, unknown> | undefined;
  const contentSeo = state?.contentSeo as Record<string, unknown> | undefined;
  const architecture = state?.architecture as Record<string, unknown> | undefined;
  const generatedFiles = (developerOutput?.generatedFiles as any[]) || [];

  const context = buildSystemContext(
    'QA / Testing Agent — Senior QA Engineer with expertise in web quality, accessibility, and security',
    {
      projectName: req.projectName,
      projectType: req.projectType,
      featuresRequested: req.featuresRequested,
      requirements: req.requirements,
      generatedFilesPaths: generatedFiles.map((f: any) => f.filePath),
      designSystem: (uiuxDesign as any)?.designSystem || {},
      seoData: (contentSeo as any)?.pagesSeoData || [],
      techStack: (architecture as any)?.techStack || {},
      implementationSummary: developerOutput?.implementationSummary || '',
    }
  );

  // Build a complete code sample for review (first 3 files)
  const codeSnippet = generatedFiles
    .slice(0, 3)
    .map((f: any) => `=== ${f.filePath} ===\n${String(f.content || '')}`)
    .join('\n\n');

  const prompt = `
${context}

GENERATED CODE SAMPLE (review for bugs and quality):
${codeSnippet || 'No code files found — flag as critical bug.'}

TASK: Perform a thorough QA review. Run the following test categories:
1. Functional Testing — do the features match requirements?
2. Responsive Design — mobile/tablet/desktop compatibility
3. SEO Validation — meta tags, headings, structured data
4. Accessibility — WCAG AA compliance, alt tags, keyboard nav
5. Security — XSS, injection vulnerabilities in the code
6. Performance — image optimization, CSS/JS efficiency
7. Content Quality — copy, CTA clarity, grammar

Return a JSON object matching this EXACT schema:
{
  "overallStatus": "PASSED" or "FAILED",
  "qualityScore": 0-100,
  "testResults": [
    { "testName": "Functional: Login Flow", "passed": true, "notes": "Login feature correctly implemented" },
    { "testName": "Responsive: Mobile Layout", "passed": false, "notes": "Navigation breaks below 375px" }
  ],
  "bugs": [
    {
      "id": "BUG-001",
      "severity": "critical",
      "category": "functional",
      "title": "Short bug title",
      "description": "Detailed description of what is broken",
      "affectedFile": "index.html",
      "suggestedFix": "Specific code or approach to fix this"
    }
  ],
  "criticalBugsCount": 0,
  "highBugsCount": 0,
  "passedTestsCount": 0,
  "totalTestsCount": 0,
  "recommendations": ["recommendation 1", "recommendation 2"],
  "readyForFounderReview": true,
  "qaSummary": "2-3 sentence summary of overall quality and what was found"
}

Rules:
- overallStatus is FAILED if criticalBugsCount > 0 OR qualityScore < 70
- overallStatus is PASSED if qualityScore >= 70 AND criticalBugsCount === 0
- readyForFounderReview is true only if overallStatus is PASSED
- Be thorough and realistic — flag real issues in the code

Return ONLY the JSON object, no other text.
  `.trim();

  const report = await runPromptAsJson<QAReport>(projectId, prompt);

  // Ensure counts are consistent
  report.criticalBugsCount = report.bugs.filter(b => b.severity === 'critical').length;
  report.highBugsCount = report.bugs.filter(b => b.severity === 'high').length;
  report.passedTestsCount = report.testResults.filter(t => t.passed).length;
  report.totalTestsCount = report.testResults.length;

  // Write QA report to Shared Project Memory
  await updateProjectState(projectId, {
    qaReport: report,
    qualityScore: report.qualityScore,
    qaStatus: report.overallStatus,
  });

  // Log to ai_logs
  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'QA',
    action: 'qa_review_complete',
    payload: {
      overallStatus: report.overallStatus,
      qualityScore: report.qualityScore,
      bugsFound: report.bugs.length,
      criticalBugs: report.criticalBugsCount,
    },
    status: report.overallStatus === 'PASSED' ? 'Success' : 'Failed',
  });

  console.log(
    `[QAAgent] Review complete. Status: ${report.overallStatus} | Score: ${report.qualityScore}/100 | Bugs: ${report.bugs.length} (${report.criticalBugsCount} critical)`
  );

  // Notify Founder if QA failed and max retries exceeded (handled by bugFixAgent)
  if (report.overallStatus === 'FAILED') {
    console.log(`[QAAgent] QA FAILED. Handing off to Bug Fix Agent...`);
  } else {
    // QA Passed — notify Founder project is ready for review
    await notifyFounder(
      projectId,
      `✅ *Project Ready for Review!*\n\n*${req.projectName}* has passed QA.\n\n📊 Quality Score: ${report.qualityScore}/100\n✅ Tests Passed: ${report.passedTestsCount}/${report.totalTestsCount}\n\nPlease review and approve via your Dashboard.`
    );
    await supabase.from('projects').update({ status: 'Review' }).eq('id', projectId);
  }

  return report;
}
