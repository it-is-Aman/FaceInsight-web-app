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
    id: "demo-illustration",
    title: "Demo face",
    description: "An illustrated face, so you can see a full report without uploading anything.",
    image: "/samples/demo-illustration.jpg",
    predictions: [
      { label: "OILY SKIN", confidence: 0.5164 },
      { label: "DULL SKIN", confidence: 0.3137 },
      { label: "DRY SKIN", confidence: 0.0821 },
    ],
    faceConfidence: 0.9285,
  },
];

export function getSample(id: string) {
  return SAMPLES.find((s) => s.id === id);
}
