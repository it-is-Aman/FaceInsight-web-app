import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getConditionByLabel } from "@/lib/conditions";
import { SAMPLES, sampleImage } from "@/lib/samples";

describe("samples", () => {
  it("only use labels the model knows, sorted by confidence", () => {
    for (const s of SAMPLES) {
      for (const p of s.predictions) expect(getConditionByLabel(p.label), p.label).toBeDefined();
      const confs = s.predictions.map((p) => p.confidence);
      expect(confs).toEqual([...confs].sort((a, b) => b - a));
    }
  });

  it("point at images that exist in public/", () => {
    for (const s of SAMPLES) expect(existsSync(join(process.cwd(), "public", s.image)), s.image).toBe(true);
  });

  it("still resolve images for retired samples", () => {
    expect(sampleImage("demo-illustration")).toBe("/samples/demo-illustration.jpg");
    expect(sampleImage(SAMPLES[0].id)).toBe(SAMPLES[0].image);
    expect(sampleImage("unknown")).toBeNull();
  });
});
