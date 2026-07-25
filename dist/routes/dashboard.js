"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dashboardRoutes;
const inputNormalizer_1 = require("../services/inputNormalizer");
const orchestrator_1 = require("../services/orchestrator");
const supabaseClient_1 = require("../db/supabaseClient");
const pmAgent_1 = require("../agents/pmAgent");
const notificationEngine_1 = require("../services/notificationEngine");
const deliveryPipeline_1 = require("../services/deliveryPipeline");
// ─────────────────────────────────────────────────────────────────────────────
async function dashboardRoutes(fastify) {
    // ─── POST: Create New Project ─────────────────────────────────────────────
    fastify.post('/v3/dashboard/projects', async (request, reply) => {
        try {
            const body = request.body;
            // Validate required fields
            if (!body.clientName || !body.clientPhone || !body.projectName || !body.projectType || !body.requirements) {
                return reply.status(400).send({ error: 'Missing required fields: clientName, clientPhone, projectName, projectType, requirements' });
            }
            // Step 1: Normalize input from Dashboard
            const normalized = (0, inputNormalizer_1.normalizeFromDashboard)(body);
            // Step 2: Run through Orchestrator — persist to Shared Memory
            let projectId = '';
            await (0, orchestrator_1.runTask)('pre-init', 'InputNormalizer', 'normalize_dashboard_input', body, async () => {
                projectId = await (0, inputNormalizer_1.persistNormalizedRequest)(normalized);
                console.log(`[Dashboard] Project ${projectId} created via Dashboard. Triggering PM Agent...`);
                return { projectId };
            });
            // Trigger PM Agent asynchronously (fire and forget — tracked via Orchestrator)
            if (projectId) {
                setImmediate(async () => {
                    await (0, orchestrator_1.runTask)(projectId, 'PM', 'run_pm_agent', {}, async () => {
                        await (0, pmAgent_1.runPmAgent)(projectId);
                    });
                });
            }
            if (!projectId) {
                return reply.status(500).send({ error: 'Failed to create project. Please try again.' });
            }
            return reply.status(201).send({
                success: true,
                message: 'Project created successfully and added to AI execution queue.',
                projectId,
            });
        }
        catch (err) {
            console.error('[Dashboard] Error creating project:', err.message);
            return reply.status(500).send({ error: 'Internal server error', details: err.message });
        }
    });
    // ─── GET: List All Projects ───────────────────────────────────────────────
    fastify.get('/v3/dashboard/projects', async (_request, reply) => {
        try {
            const { data, error } = await supabaseClient_1.supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return reply.status(200).send({ success: true, projects: data });
        }
        catch (err) {
            console.error('[Dashboard] Error listing projects:', err.message);
            return reply.status(500).send({ error: 'Failed to fetch projects' });
        }
    });
    // ─── GET: Single Project with State ──────────────────────────────────────
    fastify.get('/v3/dashboard/projects/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { data: project, error: projectError } = await supabaseClient_1.supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();
            if (projectError || !project) {
                return reply.status(404).send({ error: 'Project not found' });
            }
            const { data: state } = await supabaseClient_1.supabase
                .from('project_state')
                .select('state_data, updated_at')
                .eq('project_id', id)
                .single();
            const { data: assets } = await supabaseClient_1.supabase
                .from('assets')
                .select('*')
                .eq('project_id', id);
            const { data: aiLogs } = await supabaseClient_1.supabase
                .from('ai_logs')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: true });
            return reply.status(200).send({
                success: true,
                project,
                state: state?.state_data || {},
                assets: assets || [],
                logs: aiLogs || [],
                costReport: (0, orchestrator_1.getCostReport)(id),
            });
        }
        catch (err) {
            console.error('[Dashboard] Error fetching project:', err.message);
            return reply.status(500).send({ error: 'Failed to fetch project' });
        }
    });
    // ─── PUT: Update Project Status (Founder Approval / Change Request) ───────
    fastify.put('/v3/dashboard/projects/:id/status', async (request, reply) => {
        try {
            const { id } = request.params;
            const { status, founderNote } = request.body;
            const validStatuses = ['Draft', 'Requirements', 'Planning', 'Execution', 'QA', 'Review', 'Completed', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return reply.status(400).send({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            }
            const { data: project } = await supabaseClient_1.supabase.from('projects').select('*').eq('id', id).single();
            if (!project)
                return reply.status(404).send({ error: 'Project not found' });
            const { error: updateError } = await supabaseClient_1.supabase
                .from('projects')
                .update({ status })
                .eq('id', id);
            if (updateError)
                throw updateError;
            // Log founder's decision in AI logs
            await supabaseClient_1.supabase.from('ai_logs').insert({
                project_id: id,
                agent_type: 'Orchestrator',
                action: 'founder_status_update',
                payload: { status, founderNote: founderNote || null },
                status: 'Success',
            });
            // ─── APPROVED → Next Phase Starts ────────────────────────────────────
            if (status === 'Completed') {
                await (0, notificationEngine_1.notifyProjectApproved)(id, project.name);
                console.log(`[Dashboard] Project ${id} approved by Founder. Moving to Delivery phase.`);
            }
            // ─── CHANGES REQUESTED → PM Creates New Tasks ────────────────────────
            if (status === 'Execution' && founderNote) {
                await (0, notificationEngine_1.notifyChangesRequested)(id, project.name, founderNote);
                // Re-trigger PM Agent to create new tasks based on Founder's note
                setImmediate(async () => {
                    await (0, orchestrator_1.runTask)(id, 'PM', 'handle_change_request', { founderNote }, async () => {
                        // Update state with change request context, then re-run PM
                        const { data: stateRow } = await supabaseClient_1.supabase
                            .from('project_state')
                            .select('state_data')
                            .eq('project_id', id)
                            .single();
                        const currentState = stateRow?.state_data || {};
                        await supabaseClient_1.supabase.from('project_state').update({
                            state_data: {
                                ...currentState,
                                changeRequests: [
                                    ...(currentState.changeRequests || []),
                                    { note: founderNote, requestedAt: new Date().toISOString() },
                                ],
                            },
                        }).eq('project_id', id);
                        await (0, pmAgent_1.runPmAgent)(id);
                    });
                });
            }
            return reply.status(200).send({ success: true, message: `Project status updated to "${status}"` });
        }
        catch (err) {
            console.error('[Dashboard] Error updating project status:', err.message);
            return reply.status(500).send({ error: 'Failed to update project status' });
        }
    });
    // ─── GET: QA Report for a Project ────────────────────────────────────────
    fastify.get('/v3/dashboard/projects/:id/qa', async (request, reply) => {
        try {
            const { id } = request.params;
            const { data: stateRow } = await supabaseClient_1.supabase
                .from('project_state')
                .select('state_data')
                .eq('project_id', id)
                .single();
            const state = stateRow?.state_data;
            const qaReport = state?.qaReport || null;
            const bugFixHistory = state?.bugFixHistory || [];
            const qualityScore = state?.qualityScore || null;
            return reply.status(200).send({
                success: true,
                qaReport,
                bugFixHistory,
                qualityScore,
            });
        }
        catch (err) {
            console.error('[Dashboard] Error fetching QA report:', err.message);
            return reply.status(500).send({ error: 'Failed to fetch QA report' });
        }
    });
    // ─── GET: AI Logs for a Project ──────────────────────────────────────────
    fastify.get('/v3/dashboard/projects/:id/logs', async (request, reply) => {
        try {
            const { id } = request.params;
            const { data, error } = await supabaseClient_1.supabase
                .from('ai_logs')
                .select('*')
                .eq('project_id', id)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return reply.status(200).send({ success: true, logs: data });
        }
        catch (err) {
            console.error('[Dashboard] Error fetching AI logs:', err.message);
            return reply.status(500).send({ error: 'Failed to fetch AI logs' });
        }
    });
    // ─── GET: Queue Status ───────────────────────────────────────────────────
    fastify.get('/v3/dashboard/queue', async (_request, reply) => {
        return reply.status(200).send({ success: true, queue: (0, orchestrator_1.getQueueStatus)() });
    });
    // ─── GET: Cost Report ───────────────────────────────────────────────────
    fastify.get('/v3/dashboard/cost/:id', async (request, reply) => {
        const { id } = request.params;
        return reply.status(200).send({ success: true, cost: (0, orchestrator_1.getCostReport)(id) });
    });
    // ─── POST: Founder Approval → Triggers Phase 5 Delivery Pipeline ─────────
    fastify.post('/v3/dashboard/projects/:id/approve', async (request, reply) => {
        try {
            const { id } = request.params;
            const { data: project } = await supabaseClient_1.supabase.from('projects').select('*').eq('id', id).single();
            if (!project)
                return reply.status(404).send({ error: 'Project not found' });
            if (project.status === 'Completed') {
                return reply.status(400).send({ error: 'Project is already completed.' });
            }
            // Acknowledge immediately
            reply.status(202).send({
                success: true,
                message: 'Project approved. Phase 5 Delivery Pipeline starting...',
                projectId: id,
            });
            // Fire Phase 5 pipeline asynchronously
            setImmediate(async () => {
                try {
                    await (0, deliveryPipeline_1.runDeliveryPipeline)(id);
                }
                catch (err) {
                    console.error(`[Dashboard] Delivery pipeline error for project ${id}:`, err.message);
                }
            });
        }
        catch (err) {
            console.error('[Dashboard] Error triggering delivery pipeline:', err.message);
            return reply.status(500).send({ error: 'Failed to start delivery pipeline' });
        }
    });
    // ─── GET: Full Deliverables Package ────────────────────────────────────────
    fastify.get('/v3/dashboard/projects/:id/deliverables', async (request, reply) => {
        try {
            const { id } = request.params;
            const { data: stateRow } = await supabaseClient_1.supabase
                .from('project_state')
                .select('state_data')
                .eq('project_id', id)
                .single();
            const state = stateRow?.state_data;
            const { data: assets } = await supabaseClient_1.supabase
                .from('assets')
                .select('*')
                .eq('project_id', id);
            return reply.status(200).send({
                success: true,
                deliverables: {
                    generatedFiles: state?.developerOutput?.generatedFiles || [],
                    deploymentFiles: state?.deployment?.deploymentFiles || [],
                    deploymentInstructions: state?.deployment?.stepByStepInstructions || [],
                    documentation: state?.documentation?.userManual || null,
                    technicalDocs: state?.documentation?.technicalDocumentation || null,
                    sops: state?.documentation?.sops || [],
                    handoverPackage: state?.handover?.projectClosureReport || null,
                    clientHandoverMessage: state?.handover?.clientHandoverMessage || null,
                    finalQaReport: state?.finalQaReport || null,
                    contentSeo: state?.contentSeo || null,
                    assets: assets || [],
                    projectClosed: state?.projectClosed || false,
                    closedAt: state?.closedAt || null,
                },
            });
        }
        catch (err) {
            console.error('[Dashboard] Error fetching deliverables:', err.message);
            return reply.status(500).send({ error: 'Failed to fetch deliverables' });
        }
    });
    // ─── GET: Public Website Preview ──────────────────────────────────────────
    const previewHandler = async (request, reply) => {
        try {
            const { id } = request.params;
            const requestedPath = request.params['*'] || 'index.html';
            const { data: stateRow } = await supabaseClient_1.supabase
                .from('project_state')
                .select('state_data')
                .eq('project_id', id)
                .single();
            if (!stateRow) {
                return reply.status(404).send('Project not found');
            }
            const state = stateRow.state_data;
            const generatedFiles = state?.developerOutput?.generatedFiles;
            if (!generatedFiles || generatedFiles.length === 0) {
                return reply.status(404).send('Website not generated yet by the AI.');
            }
            // Find the requested file. Match exact, or filename match.
            // E.g. if requestedPath is "index.html", we might match "public/index.html"
            let file = generatedFiles.find(f => f.filePath === requestedPath || f.filePath.endsWith('/' + requestedPath));
            // If user requested root but file is something else like main.html, fallback to first html file if index is missing
            if (!file && requestedPath === 'index.html') {
                file = generatedFiles.find(f => f.filePath.endsWith('.html'));
            }
            if (!file) {
                return reply.status(404).send('File not found: ' + requestedPath);
            }
            // Set content type based on extension
            let contentType = 'text/plain';
            if (file.filePath.endsWith('.html'))
                contentType = 'text/html';
            else if (file.filePath.endsWith('.css'))
                contentType = 'text/css';
            else if (file.filePath.endsWith('.js'))
                contentType = 'application/javascript';
            else if (file.filePath.endsWith('.json'))
                contentType = 'application/json';
            reply.header('Content-Type', contentType);
            return reply.send(file.content);
        }
        catch (err) {
            console.error('[Preview] Error serving preview:', err.message);
            return reply.status(500).send('Internal Server Error');
        }
    };
    // Redirect without trailing slash to ensure relative assets (like styles.css) resolve correctly
    fastify.get('/project-preview/:id', async (request, reply) => {
        return reply.redirect(301, `/project-preview/${request.params.id}/`);
    });
    fastify.get('/project-preview/:id/*', previewHandler);
}
