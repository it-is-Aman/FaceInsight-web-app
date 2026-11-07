#!/usr/bin/env node
/**
 * Run a demo image through the real ML service and print a ready-to-paste entry for src/lib/samples.ts.
 *
 *   ML_SERVICE_URL=http://localhost:7860 ML_API_KEY=... node scripts/sample-predictions.mjs public/samples/my-photo.jpg
 *
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

const base = (process.env.ML_SERVICE_URL ?? "http://localhost:7860").replace(/\/+$/, "");
const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const type = types[extname(file).toLowerCase()];
if (!type) {
  console.error("Use a .jpg, .png or .webp image.");
  process.exit(1);
}

const form = new FormData();
form.append("file", new Blob([await readFile(file)], { type }), basename(file));

const res = await fetch(`${base}/predict`, {
  method: "POST",
  body: form,
  headers: { "X-API-Key": process.env.ML_API_KEY ?? "" },
});
const body = await res.json().catch(() => null);
if (!res.ok) {
  console.error(`ML service returned ${res.status}:`, body?.error ?? body);
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
