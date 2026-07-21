"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHandoverAgent = runHandoverAgent;
// ─────────────────────────────────────────────────────────────────────────────
// HANDOVER AGENT
// Compiles the complete client handover package. Outputs:
//   - Credentials summary (domains, hosting, accounts)
//   - Access instructions
//   - Training summary
//   - Project closure report
//   - Final WhatsApp message to Founder with full summary
// ─────────────────────────────────────────────────────────────────────────────
const aiBase_1 = require("./aiBase");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
const whatsapp_1 = require("../services/whatsapp");
const notificationEngine_1 = require("../services/notificationEngine");
async function runHandoverAgent(projectId) {
    console.log(`[HandoverAgent] Compiling handover package for project: ${projectId}`);
    const { data: stateRow } = await supabaseClient_1.supabase
        .from('project_state')
        .select('state_data')
        .eq('project_id', projectId)
        .single();
    const state = stateRow?.state_data;
    const req = state?.normalizedRequest;
    const architecture = state?.architecture;
    const finalQa = state?.finalQaReport;
    const deployment = state?.deployment;
    const projectPlan = state?.projectPlan;
    const contentSeo = state?.contentSeo;
    const documentation = state?.documentation;
    const context = (0, aiBase_1.buildSystemContext)('Handover Agent — Senior Project Delivery Manager preparing the complete client handover package', {
        projectName: req.projectName,
        projectType: req.projectType,
        clientName: req.clientName,
        clientPhone: req.clientPhone,
        companyName: req.companyName,
        featuresDelivered: req.featuresRequested,
        techStack: architecture?.techStack || {},
        deploymentPlatform: deployment?.recommendedPlatform || 'Vercel',
        finalQaScore: finalQa?.finalScore || 90,
        finalQaVerdict: finalQa?.overallVerdict || 'APPROVED_FOR_DEPLOYMENT',
        projectSummary: projectPlan?.projectSummary || '',
        pagesBuilt: contentSeo?.pagesSeoData?.map((p) => p.pageName) || ['Home'],
        documentationReady: !!documentation,
    });
    const prompt = `
${context}

TASK: Generate the complete client handover package for project closure.

Return a JSON object matching this EXACT schema:
{
  "projectClosureReport": {
    "projectName": "${req.projectName}",
    "clientName": "${req.clientName}",
    "projectType": "${req.projectType}",
    "deliveryDate": "${new Date().toISOString().split('T')[0]}",
    "featuresDelivered": ["feature 1", "feature 2"],
    "featuresNotDelivered": [],
    "technicalStack": "Summary of tech stack used",
    "hostingDetails": "Where the project is hosted and how",
    "finalQualityScore": 92,
    "projectSummary": "2-3 sentence executive summary of the delivered project"
  },
  "credentialsSummary": {
    "note": "IMPORTANT: Store all credentials securely. Never share passwords via WhatsApp or email.",
    "items": [
      {
        "service": "Hosting Platform (e.g., Vercel)",
        "accessMethod": "Login at vercel.com with your email",
        "whoManages": "Client",
        "notes": "Free tier, upgrade if traffic increases"
      },
      {
        "service": "Domain Name",
        "accessMethod": "Login to your domain registrar",
        "whoManages": "Client",
        "notes": "Renew annually"
      },
      {
        "service": "Database (Supabase)",
        "accessMethod": "Login at supabase.com",
        "whoManages": "Development Team",
        "notes": "Contact developer for database access"
      }
    ]
  },
  "trainingTopics": [
    {
      "topic": "How to update website content",
      "duration": "15 minutes",
      "description": "Walk through content management process"
    },
    {
      "topic": "Understanding your analytics",
      "duration": "10 minutes",
      "description": "How to read visitor data"
    }
  ],
  "nextStepsForClient": [
    "Complete payment for final milestone",
    "Review and sign off on all deliverables",
    "Book a training call with the team",
    "Share the live URL with your customers"
  ],
  "founderWhatsAppMessage": "Complete WhatsApp message to send to the Founder summarising project closure",
  "clientHandoverMessage": "Complete professional WhatsApp/email message to send to the client on project delivery",
  "projectStatus": "CLOSED"
}

Make the founderWhatsAppMessage and clientHandoverMessage professional, warm, and complete.
Return ONLY the JSON object, no other text.
  `.trim();
    const output = await (0, aiBase_1.runPromptAsJson)(projectId, prompt);
    // Save handover package as asset
    await supabaseClient_1.supabase.from('assets').insert({
        project_id: projectId,
        file_url: `handover://${projectId}/closure-package`,
        asset_type: 'Document',
    });
    // Update Shared Project Memory with full handover data
    await (0, orchestrator_1.updateProjectState)(projectId, {
        handover: output,
        projectClosed: true,
        closedAt: new Date().toISOString(),
    });
    // Mark project as Completed in Supabase
    await supabaseClient_1.supabase.from('projects').update({ status: 'Completed' }).eq('id', projectId);
    // Log closure
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: projectId,
        agent_type: 'Documentation',
        action: 'project_closed',
        payload: {
            deliveryDate: output.projectClosureReport.deliveryDate,
            featuresDelivered: output.projectClosureReport.featuresDelivered.length,
            finalQualityScore: output.projectClosureReport.finalQualityScore,
        },
        status: 'Success',
    });
    // Send Founder the closure WhatsApp message
    const FOUNDER_PHONE = process.env.FOUNDER_PHONE_NUMBER || '';
    if (FOUNDER_PHONE) {
        await (0, whatsapp_1.sendTextMessage)(FOUNDER_PHONE, output.founderWhatsAppMessage);
    }
    await (0, notificationEngine_1.notifyProjectApproved)(projectId, req.projectName);
    console.log(`[HandoverAgent] ✅ PROJECT CLOSED: ${req.projectName} (${projectId})`);
    return output;
}
