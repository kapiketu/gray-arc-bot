"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = whatsappV3Routes;
const inputNormalizer_1 = require("../services/inputNormalizer");
const orchestrator_1 = require("../services/orchestrator");
const pmAgent_1 = require("../agents/pmAgent");
async function whatsappV3Routes(fastify) {
    // ─── Webhook Verification (GET) ────────────────────────────────────────────
    fastify.get('/v3/whatsapp', async (request, reply) => {
        const mode = request.query['hub.mode'];
        const token = request.query['hub.verify_token'];
        const challenge = request.query['hub.challenge'];
        if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
            console.log('[WhatsAppV3] Webhook verification successful.');
            return reply.status(200).send(challenge);
        }
        console.warn('[WhatsAppV3] Webhook verification failed.');
        return reply.status(403).send({ error: 'Forbidden' });
    });
    // ─── Incoming Messages (POST) ──────────────────────────────────────────────
    fastify.post('/v3/whatsapp', async (request, reply) => {
        // Always acknowledge immediately (Meta expects 200 within 20s)
        reply.status(200).send({ status: 'received' });
        try {
            const body = request.body;
            if (body.object !== 'whatsapp_business_account')
                return;
            const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
            if (!messages || messages.length === 0)
                return;
            for (const message of messages) {
                // Only handle text messages for now
                if (message.type !== 'text' || !message.text?.body)
                    continue;
                const from = message.from;
                const messageBody = message.text.body;
                console.log(`[WhatsAppV3] Incoming message from ${from}: "${messageBody}"`);
                // Step 1: Normalize the input
                const normalized = (0, inputNormalizer_1.normalizeFromWhatsApp)({ from, messageBody });
                // Step 2: Run through orchestrator — persist to Shared Memory then hand off to PM Agent
                await (0, orchestrator_1.runTask)('pre-init', 'InputNormalizer', 'normalize_whatsapp_input', { from, messageBody }, async () => {
                    const projectId = await (0, inputNormalizer_1.persistNormalizedRequest)(normalized);
                    console.log(`[WhatsAppV3] Project ${projectId} created. Triggering PM Agent...`);
                    // Trigger PM Agent asynchronously
                    setImmediate(async () => {
                        await (0, orchestrator_1.runTask)(projectId, 'PM', 'run_pm_agent', {}, async () => {
                            await (0, pmAgent_1.runPmAgent)(projectId);
                        });
                    });
                    return { projectId };
                });
            }
        }
        catch (err) {
            console.error('[WhatsAppV3] Error processing incoming message:', err.message);
        }
    });
}
