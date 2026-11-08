import type { Prediction } from "@/lib/analysis";

/**
 * Demo inputs so visitors (and recruiters) can see a full report without uploading their own face.
 * Predictions were produced by the real model: run `node scripts/sample-predictions.mjs <image>`
 * against the ML service and paste the output here. Only use photos you have the rights to.
 */
export interface Sample {
  id: string;
  title: string;
  description: string;
  image: string;
  predictions: Prediction[];
  faceConfidence: number;
}

export const SAMPLES: Sample[] = [
  {
    // AI-generated face (this-person-does-not-exist.com, watermark kept): not a real person.
    id: "ai-face",
    title: "Sample face (AI-generated)",
    description: "A face that doesn't belong to anyone, so you can see a full report without uploading your own.",
    image: "/samples/ai-face.jpg",
    predictions: [
      { label: "HORMONAL ACNE", confidence: 0.8595 },
      { label: "DARK CIRCLES ON FACE", confidence: 0.0571 },
      { label: "FOREHEAD WRINKLES", confidence: 0.0289 },
    ],
    faceConfidence: 0.9248,
  },
];

export function getSample(id: string) {
  return SAMPLES.find((s) => s.id === id);
}

/** Images for retired samples, so demo reports created before a sample was replaced still show their photo. */
const RETIRED_SAMPLE_IMAGES: Record<string, string> = {
  "demo-illustration": "/samples/demo-illustration.jpg",
};

export function sampleImage(id: string): string | null {
  return getSample(id)?.image ?? RETIRED_SAMPLE_IMAGES[id] ?? null;
}
