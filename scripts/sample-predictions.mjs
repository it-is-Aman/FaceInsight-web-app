#!/usr/bin/env node
/**
 * Run a demo image through the real ML service and print a ready-to-paste entry for src/lib/samples.ts.
 *
 *   node scripts/sample-predictions.mjs public/samples/my-photo.jpg
 *
 * Reads ML_SERVICE_URL, ML_API_KEY (and HF_TOKEN for a private Space) from .env.
 * Works with the Hugging Face Gradio Space (*.hf.space) and the FastAPI /predict service.
 * Only use photos you have the rights to publish.
 */
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import "dotenv/config";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/sample-predictions.mjs <image in public/samples/>");
  process.exit(1);
}

const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const type = types[extname(file).toLowerCase()];
if (!type) {
  console.error("Use a .jpg, .png or .webp image.");
  process.exit(1);
}

const base = (process.env.ML_SERVICE_URL ?? "http://localhost:7860").replace(/\/+$/, "");
const apiKey = process.env.ML_API_KEY ?? "";
const auth = process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {};
const backend =
  process.env.ML_BACKEND && process.env.ML_BACKEND !== "auto"
    ? process.env.ML_BACKEND
    : new URL(base).hostname.endsWith(".hf.space")
      ? "gradio"
      : "fastapi";
const bytes = await readFile(file);

async function viaGradio() {
  const call = await fetch(`${base}/gradio_api/call/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify({ data: [bytes.toString("base64"), apiKey] }),
  });
  const { event_id } = await call.json().catch(() => ({}));
  if (!call.ok || !event_id) throw new Error(`Space did not accept the call (HTTP ${call.status}). Is it awake?`);
  const sse = await (await fetch(`${base}/gradio_api/call/analyze/${event_id}`, { headers: auth })).text();
  const block = sse.split(/\r?\n\r?\n/).find((b) => b.includes("event: complete"));
  if (!block) throw new Error(`Unexpected response from Space:\n${sse.slice(0, 300)}`);
  const data = block.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
  return JSON.parse(data)[0];
}

async function viaFastapi() {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), basename(file));
  const res = await fetch(`${base}/predict`, { method: "POST", body: form, headers: { "X-API-Key": apiKey } });
  return res.json();
}

const body = backend === "gradio" ? await viaGradio() : await viaFastapi();
if (!body?.predictions) {
  console.error("ML service returned an error:", body?.error ?? body);
  process.exit(1);
}

const id = basename(file, extname(file));
const publicPath = file.includes("public/") ? file.slice(file.indexOf("public/") + "public".length) : `/samples/${basename(file)}`;

console.log(`  {
    id: ${JSON.stringify(id)},
    title: "TODO title",
    description: "TODO one-line description",
    image: ${JSON.stringify(publicPath)},
    predictions: ${JSON.stringify(body.predictions)},
    faceConfidence: ${body.face?.confidence ?? 0},
  },`);
