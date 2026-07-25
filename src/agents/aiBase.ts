// ─────────────────────────────────────────────────────────────────────────────
// AI BASE WRAPPER
// Shared AI helper used by all agents in the system.
// Supports both OpenAI and DeepSeek via the official OpenAI SDK.
// ─────────────────────────────────────────────────────────────────────────────
import OpenAI from 'openai';
import { trackCost } from '../services/orchestrator';
import dotenv from 'dotenv';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'deepseek'
const AI_API_KEY = process.env.AI_API_KEY || 'dummy_key_to_prevent_startup_crash';

if (!AI_API_KEY) {
  console.warn(`[AIBase] AI_API_KEY is not set for provider ${AI_PROVIDER}. AI agents will fail.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE CLIENT
// ─────────────────────────────────────────────────────────────────────────────
const clientOptions: any = {
  apiKey: AI_API_KEY,
};

if (AI_PROVIDER === 'deepseek') {
  clientOptions.baseURL = 'https://api.deepseek.com';
}

// Singleton OpenAI client
const aiClient = new OpenAI(clientOptions);

const DEFAULT_MODEL = AI_PROVIDER === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

// ─────────────────────────────────────────────────────────────────────────────
// RUN PROMPT
// Sends a prompt and returns the raw text response.
// ─────────────────────────────────────────────────────────────────────────────
export async function runPrompt(
  projectId: string,
  prompt: string,
  modelName: string = DEFAULT_MODEL
): Promise<string> {
  const response = await aiClient.chat.completions.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 8192,
  });

  const text = response.choices[0]?.message?.content || '';

  // Track token usage for cost monitoring
  const usage = response.usage;
  if (usage?.total_tokens) {
    trackCost(projectId, usage.total_tokens);
  }

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN PROMPT AS JSON
// Sends a prompt and parses the JSON response. Strips markdown code fences.
// Throws if response is not valid JSON.
// ─────────────────────────────────────────────────────────────────────────────
export async function runPromptAsJson<T = Record<string, unknown>>(
  projectId: string,
  prompt: string,
  modelName: string = DEFAULT_MODEL
): Promise<T> {
  const response = await aiClient.chat.completions.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: 'json_object' } // Force JSON mode
  });

  const raw = response.choices[0]?.message?.content || '';

  let cleaned = raw;
  // If the response contains markdown code blocks, extract the content
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    cleaned = match[1];
  } else {
    // Fallback: trim whitespace if no code block
    cleaned = raw.trim();
  }

  // Track token usage for cost monitoring
  const usage = response.usage;
  if (usage?.total_tokens) {
    trackCost(projectId, usage.total_tokens);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('[AIBase] Failed to parse JSON response:', raw.substring(0, 300));
    throw new Error('AI returned invalid JSON. Raw response logged above.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD SYSTEM CONTEXT
// Injects the project context into the start of every prompt.
// ─────────────────────────────────────────────────────────────────────────────
export function buildSystemContext(agentRole: string, projectContext: Record<string, unknown>): string {
  return `
You are an expert AI agent acting as: ${agentRole}

You are part of an automated AI Agency system. You will receive project context and must return a precise, structured JSON response as instructed.
Always respond with ONLY valid JSON — no markdown, no explanations outside the JSON.

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}
  `.trim();
}
