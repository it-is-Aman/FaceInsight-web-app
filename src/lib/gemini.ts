import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { insightsSchema, type Insights, type Prediction } from "@/lib/analysis";
import { conditionName, confidenceBand } from "@/lib/conditions";
import { env } from "@/lib/env";

let client: GoogleGenAI | undefined;
function ai() {
  // Fail fast and fall back to another model instead of letting the SDK retry for a minute.
  client ??= new GoogleGenAI({
    apiKey: env().GEMINI_API_KEY,
    httpOptions: { timeout: 25_000, retryOptions: { attempts: 1 } },
  });
  return client;
}

/** Primary model first, then the fallback (if different). */
function models() {
  const { GEMINI_MODEL, GEMINI_FALLBACK_MODEL } = env();
  return [...new Set([GEMINI_MODEL, GEMINI_FALLBACK_MODEL])];
}

function isRetryable(e: unknown) {
  const status = (e as { status?: number })?.status;
  // 404 = model retired, 429 = rate limited, 5xx = overloaded
  return status === undefined || status === 404 || status === 429 || status >= 500;
}

/** Run `fn` against each model until one succeeds (overloaded models return 503/429). */
async function withFallback<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const model of models()) {
    try {
      return await fn(model);
    } catch (e) {
      lastError = e;
      if (!isRetryable(e)) break;
      console.warn(`[gemini] ${model} failed (${(e as { status?: number })?.status ?? "network"}), trying fallback`);
    }
  }
  throw lastError;
}

const SAFETY_RULES = `
- You are a friendly skincare guide, not a doctor. Never diagnose, prescribe medication, or name prescription-only drugs as a recommendation.
- The results come from an image classifier and can be wrong. Match your certainty to the confidence band.
- Keep advice practical, evidence-based and accessible (over-the-counter, lifestyle).
- If something sounds urgent (bleeding, rapidly changing spots, infection, severe pain), tell the user to see a dermatologist.
- Plain language, no jargon without a short explanation.`;

function describePredictions(predictions: Prediction[]) {
  return predictions
    .map((p) => `- ${p.label} (${conditionName(p.label)}): ${(p.confidence * 100).toFixed(0)}% → ${confidenceBand(p.confidence)}`)
    .join("\n");
}

// Gemini's structured output takes a JSON Schema; drop the $schema meta key.
const insightsJsonSchema = z.toJSONSchema(insightsSchema) as Record<string, unknown>;
delete insightsJsonSchema.$schema;

export async function generateInsights(predictions: Prediction[]): Promise<Insights> {
  const res = await withFallback((model) =>
    ai().models.generateContent({
      model,
      contents: `A face photo was analysed by a skin-concern classifier. Top results:\n${describePredictions(predictions)}\n\nCreate a personalised, concise care guide for these concerns.`,
      config: {
        systemInstruction: SAFETY_RULES,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseJsonSchema: insightsJsonSchema,
      },
    }),
  );
  const text = res.text;
  if (!text) throw new Error("Empty response from Gemini");
  return insightsSchema.parse(JSON.parse(text));
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** Streams the assistant reply as plain-text chunks. */
export async function* streamChatReply(predictions: Prediction[], history: ChatTurn[]): AsyncGenerator<string> {
  // Fallback only applies to opening the stream; once tokens flow we stay on that model.
  const stream = await withFallback((model) =>
    ai().models.generateContentStream({
      model,
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `${SAFETY_RULES}
- The user is asking follow-up questions about their own analysis:
${describePredictions(predictions)}
- Answer in under 150 words unless asked for detail. Use short paragraphs or bullet lists (Markdown).
- Politely decline questions unrelated to skin, skincare or these results.`,
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    }),
  );
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}
