"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPrompt = runPrompt;
exports.runPromptAsJson = runPromptAsJson;
exports.buildSystemContext = buildSystemContext;
// ─────────────────────────────────────────────────────────────────────────────
// AI BASE WRAPPER
// Shared AI helper used by all agents in the system.
// Supports both OpenAI and DeepSeek via the official OpenAI SDK.
// ─────────────────────────────────────────────────────────────────────────────
const openai_1 = __importDefault(require("openai"));
const orchestrator_1 = require("../services/orchestrator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'deepseek'
const AI_API_KEY = process.env.AI_API_KEY || '';
if (!AI_API_KEY) {
    console.warn(`[AIBase] AI_API_KEY is not set for provider ${AI_PROVIDER}. AI agents will fail.`);
}
// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE CLIENT
// ─────────────────────────────────────────────────────────────────────────────
const clientOptions = {
    apiKey: AI_API_KEY,
};
if (AI_PROVIDER === 'deepseek') {
    clientOptions.baseURL = 'https://api.deepseek.com';
}
// Singleton OpenAI client
const aiClient = new openai_1.default(clientOptions);
const DEFAULT_MODEL = AI_PROVIDER === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
// ─────────────────────────────────────────────────────────────────────────────
// RUN PROMPT
// Sends a prompt and returns the raw text response.
// ─────────────────────────────────────────────────────────────────────────────
async function runPrompt(projectId, prompt, modelName = DEFAULT_MODEL) {
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
        (0, orchestrator_1.trackCost)(projectId, usage.total_tokens);
    }
    return text;
}
// ─────────────────────────────────────────────────────────────────────────────
// RUN PROMPT AS JSON
// Sends a prompt and parses the JSON response. Strips markdown code fences.
// Throws if response is not valid JSON.
// ─────────────────────────────────────────────────────────────────────────────
async function runPromptAsJson(projectId, prompt, modelName = DEFAULT_MODEL) {
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
    }
    else {
        // Fallback: trim whitespace if no code block
        cleaned = raw.trim();
    }
    // Track token usage for cost monitoring
    const usage = response.usage;
    if (usage?.total_tokens) {
        (0, orchestrator_1.trackCost)(projectId, usage.total_tokens);
    }
    try {
        return JSON.parse(cleaned);
    }
    catch (err) {
        console.error('[AIBase] Failed to parse JSON response:', raw.substring(0, 300));
        throw new Error('AI returned invalid JSON. Raw response logged above.');
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// BUILD SYSTEM CONTEXT
// Injects the project context into the start of every prompt.
// ─────────────────────────────────────────────────────────────────────────────
function buildSystemContext(agentRole, projectContext) {
    return `
You are an expert AI agent acting as: ${agentRole}

You are part of an automated AI Agency system. You will receive project context and must return a precise, structured JSON response as instructed.
Always respond with ONLY valid JSON — no markdown, no explanations outside the JSON.

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}
  `.trim();
}
