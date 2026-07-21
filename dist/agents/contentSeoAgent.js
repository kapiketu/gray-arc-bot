"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runContentSeoAgent = runContentSeoAgent;
// ─────────────────────────────────────────────────────────────────────────────
// CONTENT / SEO AGENT
// Generates all copy, content, and SEO metadata for the project.
// Outputs: Page copy, meta tags, keywords, structured data (JSON-LD),
//          Open Graph tags, sitemap structure.
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
async function runContentSeoAgent(projectId) {
    console.log(`[ContentSEOAgent] Starting for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const businessAnalysis = state?.businessAnalysis;
    const uiuxDesign = state?.uiuxDesign;
    const context = (0, aiBase_1.buildSystemContext)('Content & SEO Agent — Senior Content Strategist and SEO Expert with 10+ years experience', {
        projectName: req.projectName,
        projectType: req.projectType,
        clientName: req.clientName,
        companyName: req.companyName,
        requirements: req.requirements,
        targetAudience: businessAnalysis?.targetAudience || {},
        industryTrends: businessAnalysis?.competitorInsights?.industryTrends || [],
        pages: uiuxDesign?.wireframe?.pages?.map((p) => p.pageName) || ['Home', 'About', 'Services', 'Contact'],
        brandVoice: uiuxDesign?.uxCopyGuidelines || {},
    });
    const prompt = `
${context}

TASK: Generate all content copy and SEO metadata for this ${req.projectType} project.

Return a JSON object matching this EXACT schema:
{
  "brandVoice": "Description of the brand tone and voice",
  "primaryKeywords": ["keyword1", "keyword2", "keyword3"],
  "secondaryKeywords": ["keyword4", "keyword5"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2"],
  "pagesSeoData": [
    {
      "pageName": "Home",
      "title": "Page title (50-60 chars) | Brand Name",
      "metaDescription": "Compelling meta description (150-160 chars)",
      "keywords": ["page specific keyword 1", "keyword 2"],
      "h1": "Primary heading for the page",
      "openGraph": {
        "title": "OG title",
        "description": "OG description",
        "imageAlt": "Image alt text"
      },
      "canonicalUrl": "https://example.com/page"
    }
  ],
  "contentBlocks": [
    {
      "sectionName": "Hero Section",
      "headline": "Bold, attention-grabbing headline",
      "subheadline": "Supporting subheadline",
      "bodyText": "Full paragraph body text for this section",
      "callToAction": "Get Started",
      "callToActionUrl": "#contact"
    }
  ],
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "${req.projectName}",
    "description": "Business description"
  },
  "sitemapStructure": [
    { "url": "/", "priority": "1.0", "changefreq": "weekly" },
    { "url": "/about", "priority": "0.8", "changefreq": "monthly" }
  ],
  "technicalSeoChecklist": [
    "Add canonical tags to all pages",
    "Implement structured data markup",
    "Optimize images with alt text",
    "Ensure mobile-first responsive design",
    "Set up Google Analytics / Search Console"
  ],
  "localSeoNotes": "Any local SEO recommendations if applicable"
}

Guidelines:
- Write all copy in the brand's voice as defined in the context
- All meta titles must be 50-60 characters
- All meta descriptions must be 150-160 characters
- Keywords should be realistic for the project type and industry
- Content blocks must have real, compelling copy — not placeholders

Return ONLY the JSON object, no other text.
  `.trim();
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    await (0, orchestrator_1.updateProjectState)(projectId, { contentSeo: output });
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Content',
        action: 'content_seo_complete',
        payload: {
            primaryKeywords: output.primaryKeywords,
            pagesCount: output.pagesSeoData.length,
            contentBlocksCount: output.contentBlocks.length,
        },
        status: 'Success',
    });
    console.log(`[ContentSEOAgent] Content & SEO complete. ${output.pagesSeoData.length} pages, ${output.primaryKeywords.length} primary keywords.`);
    return output;
}
