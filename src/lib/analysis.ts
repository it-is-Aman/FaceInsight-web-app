import { z } from "zod";

/** Shared (client + server) shapes for an analysis. */

export const predictionSchema = z.object({ label: z.string(), confidence: z.number() });
export const predictionsSchema = z.array(predictionSchema);
export type Prediction = z.infer<typeof predictionSchema>;

const routineStep = z.object({
  step: z.string().describe("Product type or action, e.g. 'Gentle gel cleanser'"),
  why: z.string().describe("One short clause on why, tied to the detected concerns"),
});

export const insightsSchema = z.object({
  overview: z
    .string()
    .describe("2-3 friendly sentences summarising what the results suggest, hedged by confidence"),
  concerns: z
    .array(
      z.object({
        label: z.string().describe("Exactly one of the detected labels, unchanged"),
        whatItIs: z.string().describe("One plain-language sentence"),
        likelyCauses: z.array(z.string()).describe("2 short items"),
        whatHelps: z.array(z.string()).describe("3-4 practical, non-prescription steps"),
        seeADermatologistIf: z.string().describe("One clear warning sign"),
      }),
    )
    .describe("One entry per detected label, same order"),
  routine: z.object({
    morning: z.array(routineStep).describe("3-5 steps, ending with sunscreen"),
    evening: z.array(routineStep).describe("3-5 steps"),
  }),
  ingredients: z
    .array(z.object({ name: z.string(), benefit: z.string() }))
    .describe("3-5 ingredients worth looking for"),
  avoid: z.array(z.string()).describe("2-4 things to avoid"),
});
export type Insights = z.infer<typeof insightsSchema>;

export interface ChatMessageDTO {
  id: string;
  role: "user" | "assistant";
  content: string;
}
