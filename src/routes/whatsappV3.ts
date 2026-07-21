// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP V3 ROUTE
// Handles the Meta WhatsApp Cloud API webhook for the AI Agency V3 flow.
// GET  /v3/whatsapp  — Webhook verification challenge (required by Meta)
// POST /v3/whatsapp  — Incoming messages, processed by Input Normalizer
// ─────────────────────────────────────────────────────────────────────────────
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { normalizeFromWhatsApp, persistNormalizedRequest } from '../services/inputNormalizer';
import { runTask } from '../services/orchestrator';
import { runPmAgent } from '../agents/pmAgent';

// Meta sends the verify token challenge on GET
interface VerifyQuery {
  'hub.mode': string;
  'hub.verify_token': string;
  'hub.challenge': string;
}

// Incoming WhatsApp webhook body shape
interface WhatsAppWebhookBody {
  object: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          type: string;
          text?: { body: string };
        }>;
        statuses?: Array<unknown>;
      };
    }>;
  }>;
}

export default async function whatsappV3Routes(fastify: FastifyInstance): Promise<void> {

  // ─── Webhook Verification (GET) ────────────────────────────────────────────
  fastify.get('/v3/whatsapp', async (
    request: FastifyRequest<{ Querystring: VerifyQuery }>,
    reply: FastifyReply
  ) => {
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
  fastify.post('/v3/whatsapp', async (
    request: FastifyRequest<{ Body: WhatsAppWebhookBody }>,
    reply: FastifyReply
  ) => {
    // Always acknowledge immediately (Meta expects 200 within 20s)
    reply.status(200).send({ status: 'received' });

    try {
      const body = request.body;
      if (body.object !== 'whatsapp_business_account') return;

      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!messages || messages.length === 0) return;

      for (const message of messages) {
        // Only handle text messages for now
        if (message.type !== 'text' || !message.text?.body) continue;

        const from = message.from;
        const messageBody = message.text.body;
        console.log(`[WhatsAppV3] Incoming message from ${from}: "${messageBody}"`);

        // Step 1: Normalize the input
        const normalized = normalizeFromWhatsApp({ from, messageBody });

        // Step 2: Run through orchestrator — persist to Shared Memory then hand off to PM Agent
        await runTask(
          'pre-init',
          'InputNormalizer',
          'normalize_whatsapp_input',
          { from, messageBody },
          async () => {
            const projectId = await persistNormalizedRequest(normalized);
            console.log(`[WhatsAppV3] Project ${projectId} created. Triggering PM Agent...`);
            // Trigger PM Agent asynchronously
            setImmediate(async () => {
              await runTask(projectId, 'PM', 'run_pm_agent', {}, async () => {
                await runPmAgent(projectId);
              });
            });
            return { projectId };
          }
        );
      }
    } catch (err: any) {
      console.error('[WhatsAppV3] Error processing incoming message:', err.message);
    }
  });
}
