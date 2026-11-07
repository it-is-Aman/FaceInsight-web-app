import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),

  ML_SERVICE_URL: z.url(),
  ML_API_KEY: z.string().default(""),
  // auto = Gradio API for *.hf.space URLs, FastAPI /predict otherwise
  ML_BACKEND: z.enum(["auto", "gradio", "fastapi"]).default("auto"),
  HF_TOKEN: z.string().default(""), // only for a private Space

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_FALLBACK_MODEL: z.string().default("gemini-flash-latest"),

  DODO_PAYMENTS_API_KEY: z.string().default(""),
  DODO_PAYMENTS_WEBHOOK_KEY: z.string().default(""),
  DODO_PAYMENTS_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).default("test_mode"),
  DODO_PAYMENTS_PRODUCT_ID_2DAYS: z.string().default(""),
  DODO_PAYMENTS_PRODUCT_ID_7DAYS: z.string().default(""),

  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  IP_HASH_SALT: z.string().default("faceinsight"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

/** Validated server-side environment. Parsed lazily so `next build` doesn't need runtime secrets. */
export function env(): ServerEnv {
  if (cached) return cached;
  const raw = {
    ...process.env,
    // Backwards-compatible names from v1
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
    DODO_PAYMENTS_WEBHOOK_KEY:
      process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
