import { describe, expect, it } from "vitest";
import { z } from "zod";
import { insightsSchema, predictionsSchema } from "@/lib/analysis";
import { isPaidPlan, PLANS } from "@/lib/plans";

describe("analysis schemas", () => {
  it("accepts ML predictions", () => {
    expect(predictionsSchema.parse([{ label: "OILY SKIN", confidence: 0.52 }])).toHaveLength(1);
  });

  it("produces a JSON schema Gemini can use", () => {
    const schema = z.toJSONSchema(insightsSchema) as { type: string; required: string[] };
    expect(schema.type).toBe("object");
    expect(schema.required).toEqual(expect.arrayContaining(["overview", "concerns", "routine"]));
  });
});

describe("plans", () => {
  it("only treats paid plans as purchasable", () => {
    expect(isPaidPlan("2days")).toBe(true);
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("7days; drop table")).toBe(false);
  });

  it("free plan includes credits", () => {
    expect(PLANS.free.analyses).toBeGreaterThan(0);
  });
});
