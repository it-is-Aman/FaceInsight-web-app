import { describe, expect, it } from "vitest";
import { CONDITIONS, confidenceBand, conditionName, getConditionByLabel } from "@/lib/conditions";

// Labels exported by the ML service (ml-model/model/labels.json). Keep in sync.
const MODEL_LABELS = [
  "BLACKHEADS", "DARK CIRCLES ON FACE", "DARK SPOTS ON FACE", "DRY SKIN", "DULL SKIN",
  "EYE BAGS", "FACE REDNESS", "FOREHEAD WRINKLES", "HORMONAL ACNE", "LARGE PORES ON FACE",
  "OILY SKIN", "RAZOR BUMPS", "ROUGH TEXTURE ON FACE", "SEBACEOUS FILAMENTS", "UNDER-EYE WRINKLES",
];

describe("conditions", () => {
  it("has content for every model label and nothing extra", () => {
    expect(CONDITIONS.map((c) => c.label).sort()).toEqual([...MODEL_LABELS].sort());
  });

  it("has unique slugs", () => {
    expect(new Set(CONDITIONS.map((c) => c.slug)).size).toBe(CONDITIONS.length);
  });

  it("maps labels to friendly names, with a fallback", () => {
    expect(getConditionByLabel("OILY SKIN")?.name).toBe("Oily skin");
    expect(conditionName("SOMETHING NEW")).toBe("Something new");
  });

  it("bands confidence", () => {
    expect(confidenceBand(0.8)).toBe("likely");
    expect(confidenceBand(0.5)).toBe("likely");
    expect(confidenceBand(0.3)).toBe("possible");
    expect(confidenceBand(0.05)).toBe("unlikely");
  });
});
