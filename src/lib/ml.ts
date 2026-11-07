import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";

/**
 * Client for the ML service. Two transports, same contract:
 * - "gradio": the Hugging Face Space (ml-model/space/gradio_app.py), via Gradio's HTTP API
 * - "fastapi": the Docker service (ml-model/app/main.py) on Render / Cloud Run / local
 * ML_BACKEND=auto picks gradio for *.hf.space URLs.
 */

const predictResponse = z.object({
  predictions: z.array(z.object({ label: z.string(), confidence: z.number().min(0).max(1) })).min(1),
  face: z.object({ detected: z.boolean(), confidence: z.number().nullable().optional() }),
  model_version: z.string(),
  inference_ms: z.number(),
});
export type PredictResponse = z.infer<typeof predictResponse>;

export type MlErrorCode = "NO_FACE" | "INVALID_IMAGE" | "FILE_TOO_LARGE" | "ML_UNAVAILABLE" | "ML_ERROR";

export class MlError extends Error {
  constructor(
    public code: MlErrorCode,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const UNAVAILABLE = new MlError(
  "ML_UNAVAILABLE",
  503,
  "The analysis model is waking up (this happens after a quiet period). Please try again in about 30 seconds.",
);

// A sleeping free Space can take ~30-60s to boot.
const TIMEOUT_MS = 90_000;

function base() {
  return env().ML_SERVICE_URL.replace(/\/+$/, "");
}

function backend(): "gradio" | "fastapi" {
  const { ML_BACKEND } = env();
  if (ML_BACKEND !== "auto") return ML_BACKEND;
  return new URL(base()).hostname.endsWith(".hf.space") ? "gradio" : "fastapi";
}

/** Only needed for a private Space. */
function authHeaders(): Record<string, string> {
  const token = env().HF_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Map the service's { error: { code, message } } to an MlError. */
function toMlError(err: { code?: string; message?: string }): MlError {
  switch (err.code) {
    case "NO_FACE":
      return new MlError("NO_FACE", 422, err.message ?? "No face detected.");
    case "INVALID_IMAGE":
    case "EMPTY_FILE":
      return new MlError("INVALID_IMAGE", 415, err.message ?? "Unsupported image.");
    case "FILE_TOO_LARGE":
      return new MlError("FILE_TOO_LARGE", 413, err.message ?? "Image is too large.");
    case "UNAUTHORIZED":
      console.error("[ml] ML_API_KEY mismatch between web app and ML service");
      return new MlError("ML_ERROR", 502, "Analysis service misconfigured.");
    default:
      console.error("[ml] unexpected error from ML service", err);
      return new MlError("ML_ERROR", 502, "The analysis service returned an error.");
  }
}

function parseResult(body: unknown): PredictResponse {
  const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
  if (err) throw toMlError(err);
  const parsed = predictResponse.safeParse(body);
  if (!parsed.success) {
    console.error("[ml] malformed response", parsed.error.issues);
    throw new MlError("ML_ERROR", 502, "The analysis service returned an unexpected response.");
  }
  return parsed.data;
}

export async function predict(image: Blob, filename = "photo.jpg"): Promise<PredictResponse> {
  return backend() === "gradio" ? predictGradio(image) : predictFastapi(image, filename);
}

// ---------------------------------------------------------------- Gradio (Hugging Face Space)

/**
 * Gradio's HTTP API is two calls:
 *   POST /gradio_api/call/analyze  {data:[base64, apiKey]}  → {event_id}
 *   GET  /gradio_api/call/analyze/{event_id}                 → SSE stream ending in `event: complete`
 */
async function predictGradio(image: Blob): Promise<PredictResponse> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const b64 = Buffer.from(await image.arrayBuffer()).toString("base64");

  let eventId: string;
  try {
    const res = await fetch(`${base()}/gradio_api/call/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ data: [b64, env().ML_API_KEY] }),
      signal,
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { event_id?: string } | null;
    // A sleeping/booting Space answers with an HTML page instead of JSON.
    if (!res.ok || !body?.event_id) {
      console.warn("[ml] gradio call not accepted", res.status);
      throw UNAVAILABLE;
    }
    eventId = body.event_id;
  } catch (e) {
    if (e instanceof MlError) throw e;
    console.error("[ml] gradio request failed", e);
    throw UNAVAILABLE;
  }

  let stream: string;
  try {
    const res = await fetch(`${base()}/gradio_api/call/analyze/${eventId}`, {
      headers: authHeaders(),
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw UNAVAILABLE;
    stream = await res.text(); // the stream closes after the final event
  } catch (e) {
    if (e instanceof MlError) throw e;
    console.error("[ml] gradio stream failed", e);
    throw UNAVAILABLE;
  }

  return parseResult(readGradioComplete(stream));
}

/** Extract the payload of the `complete` event from a Gradio SSE body. Exported for tests. */
export function readGradioComplete(sse: string): unknown {
  for (const block of sse.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/);
    const event = lines.find((l) => l.startsWith("event:"))?.slice(6).trim();
    const data = lines
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim())
      .join("\n");
    if (event === "complete") {
      const payload = JSON.parse(data) as unknown[];
      return payload[0];
    }
    if (event === "error") {
      console.error("[ml] gradio error event", data);
      throw new MlError("ML_ERROR", 502, "The analysis service returned an error.");
    }
  }
  throw new MlError("ML_ERROR", 502, "The analysis service returned an unexpected response.");
}

// ---------------------------------------------------------------- FastAPI (Docker hosts)

async function predictFastapi(image: Blob, filename: string): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", image, filename);

  let res: Response;
  try {
    res = await fetch(`${base()}/predict`, {
      method: "POST",
      body: form,
      headers: { "X-API-Key": env().ML_API_KEY },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (e) {
    console.error("[ml] request failed", e);
    throw UNAVAILABLE;
  }

  const body: unknown = await res.json().catch(() => null);
  // Free hosts return an HTML 502/503 page while the instance is starting.
  if (!res.ok && (body === null || res.status === 502 || res.status === 503)) throw UNAVAILABLE;
  return parseResult(body);
}

// ---------------------------------------------------------------- wake-up ping

/** Fire-and-forget ping so a sleeping ML host starts booting while the user picks a photo. */
export async function wake(): Promise<boolean> {
  const path = backend() === "gradio" ? "/gradio_api/info" : "/health";
  try {
    const res = await fetch(`${base()}${path}`, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
