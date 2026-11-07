import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";

const predictResponse = z.object({
  predictions: z.array(z.object({ label: z.string(), confidence: z.number().min(0).max(1) })).min(1),
  face: z.object({ detected: z.boolean(), confidence: z.number().nullable().optional() }),
  model_version: z.string(),
  inference_ms: z.number(),
});
export type PredictResponse = z.infer<typeof predictResponse>;

export type MlErrorCode =
  | "NO_FACE"
  | "INVALID_IMAGE"
  | "FILE_TOO_LARGE"
  | "ML_UNAVAILABLE"
  | "ML_ERROR";

export class MlError extends Error {
  constructor(
    public code: MlErrorCode,
    public status: number,
    message: string,
  ) {
    super(message);
  }
  /** Errors caused by the photo itself; these still cost nothing because we refund. */
  get isUserFacing() {
    return this.code === "NO_FACE" || this.code === "INVALID_IMAGE" || this.code === "FILE_TOO_LARGE";
  }
}

const UNAVAILABLE = new MlError(
  "ML_UNAVAILABLE",
  503,
  "The analysis model is waking up (this happens after a quiet period). Please try again in about 30 seconds.",
);

function base() {
  return env().ML_SERVICE_URL.replace(/\/+$/, "");
}

export async function predict(image: Blob, filename = "photo.jpg"): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", image, filename);

  let res: Response;
  try {
    res = await fetch(`${base()}/predict`, {
      method: "POST",
      body: form,
      headers: { "X-API-Key": env().ML_API_KEY },
      // A sleeping Hugging Face Space can take ~30-60s to boot.
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });
  } catch (e) {
    console.error("[ml] request failed", e);
    throw UNAVAILABLE;
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
    switch (err?.code) {
      case "NO_FACE":
        throw new MlError("NO_FACE", 422, err.message ?? "No face detected.");
      case "INVALID_IMAGE":
      case "EMPTY_FILE":
        throw new MlError("INVALID_IMAGE", 415, err.message ?? "Unsupported image.");
      case "FILE_TOO_LARGE":
        throw new MlError("FILE_TOO_LARGE", 413, err.message ?? "Image is too large.");
      case "UNAUTHORIZED":
        console.error("[ml] ML_API_KEY mismatch between web app and ML service");
        throw new MlError("ML_ERROR", 502, "Analysis service misconfigured.");
    }
    // HF returns an HTML 503 page while a Space is starting.
    if (res.status === 503 || res.status === 502 || body === null) throw UNAVAILABLE;
    console.error("[ml] unexpected response", res.status, body);
    throw new MlError("ML_ERROR", 502, "The analysis service returned an error.");
  }

  const parsed = predictResponse.safeParse(body);
  if (!parsed.success) {
    console.error("[ml] malformed response", parsed.error.issues);
    throw new MlError("ML_ERROR", 502, "The analysis service returned an unexpected response.");
  }
  return parsed.data;
}

/** Fire-and-forget ping so a sleeping Space starts booting while the user picks a photo. */
export async function wake(): Promise<boolean> {
  try {
    const res = await fetch(`${base()}/health`, { signal: AbortSignal.timeout(4_000), cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
