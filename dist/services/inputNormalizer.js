"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFromWhatsApp = normalizeFromWhatsApp;
exports.normalizeFromDashboard = normalizeFromDashboard;
exports.persistNormalizedRequest = persistNormalizedRequest;
// ─────────────────────────────────────────────────────────────────────────────
// INPUT NORMALIZER AGENT
// Converts every request (from WhatsApp or Founder Dashboard) into one
// standard NormalizedRequest format, then creates the initial project record
// in Supabase (Shared Project Memory).
// ─────────────────────────────────────────────────────────────────────────────
const supabaseClient_1 = require("../db/supabaseClient");
// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE FROM WHATSAPP
// Parses the raw WhatsApp message (plain text collected via conversational flow)
// into a NormalizedRequest.
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFromWhatsApp(raw) {
    const lines = raw.messageBody.split('\n').map(l => l.trim()).filter(Boolean);
    // Attempt to extract structured data from message body
    // Expected format (captured from conversational flow):
    // Name: John Doe
    // Company: Acme Corp
    // Email: john@acme.com
    // Project: My Portfolio
    // Type: Website
    // Requirements: I need a portfolio with 5 sections...
    // Features: contact form, gallery, blog
    const extract = (key) => {
        const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase() + ':'));
        return line ? line.substring(line.indexOf(':') + 1).trim() : '';
    };
    const projectType = (extract('type') || 'Website');
    const featuresRaw = extract('features');
    const featuresRequested = featuresRaw
        ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean)
        : [];
    return {
        channel: 'whatsapp',
        receivedAt: new Date().toISOString(),
        clientName: extract('name') || 'Unknown',
        clientPhone: raw.from,
        clientEmail: extract('email') || undefined,
        companyName: extract('company') || undefined,
        projectName: extract('project') || `Project from ${raw.from}`,
        projectType,
        requirements: extract('requirements') || raw.messageBody,
        featuresRequested,
        referenceUrls: undefined,
        documentUrls: raw.mediaUrls,
        rawPayload: raw,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZE FROM DASHBOARD
// Parses a structured JSON form submission from the Founder Dashboard.
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFromDashboard(raw) {
    return {
        channel: 'dashboard',
        receivedAt: new Date().toISOString(),
        clientName: raw.clientName,
        clientPhone: raw.clientPhone,
        clientEmail: raw.clientEmail,
        companyName: raw.companyName,
        projectName: raw.projectName,
        projectType: raw.projectType,
        requirements: raw.requirements,
        featuresRequested: raw.featuresRequested || [],
        referenceUrls: raw.referenceUrls,
        documentUrls: raw.documentUrls,
        rawPayload: raw,
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// PERSIST TO SHARED PROJECT MEMORY
// Creates the initial project + project_state records in Supabase.
// Returns the new project ID.
// ─────────────────────────────────────────────────────────────────────────────
async function persistNormalizedRequest(req) {
    console.log('[InputNormalizer] Persisting normalized request to Shared Project Memory...');
    // 1. Create project record
    const { data: project, error: projectError } = await supabaseClient_1.supabase
        .from('projects')
        .insert({
        name: req.projectName,
        type: req.projectType,
        status: 'Requirements',
    })
        .select()
        .single();
    if (projectError || !project) {
        console.error('[InputNormalizer] Error creating project:', projectError);
        throw new Error(`Failed to create project: ${projectError?.message}`);
    }
    console.log(`[InputNormalizer] Project created. ID: ${project.id}`);
    // 2. Create initial project_state (the AI Brain's working memory)
    const initialState = {
        normalizedRequest: req,
        phases: [],
        milestones: [],
        activeAgents: [],
        currentPhase: null,
        qualityScore: null,
        retryCount: 0,
        logs: [
            {
                timestamp: new Date().toISOString(),
                message: `Project created via ${req.channel}. Input Normalizer complete.`,
            },
        ],
    };
    const { error: stateError } = await supabaseClient_1.supabase
        .from('project_state')
        .insert({
        project_id: project.id,
        state_data: initialState,
    });
    if (stateError) {
        console.error('[InputNormalizer] Error creating project state:', stateError);
        throw new Error(`Failed to create project state: ${stateError.message}`);
    }
    // 3. Log this agent's action in ai_logs
    await supabaseClient_1.supabase.from('ai_logs').insert({
        project_id: project.id,
        agent_type: 'InputNormalizer',
        action: 'normalize_and_persist',
        payload: { input: req, output: initialState },
        status: 'Success',
    });
    console.log('[InputNormalizer] Shared Project Memory initialized successfully.');
    return project.id;
}
