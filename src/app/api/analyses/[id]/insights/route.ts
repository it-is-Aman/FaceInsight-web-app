import { NextResponse } from "next/server";
import { getAnalysisForViewer, parseInsights, parsePredictions } from "@/lib/analyses.server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { generateInsights } from "@/lib/gemini";
import { getViewer } from "@/lib/viewer";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Returns the AI care guide for an analysis, generating and caching it on first request. */
export async function POST(_req: Request, ctx: RouteContext<"/api/analyses/[id]/insights">) {
  const { id } = await ctx.params;
  const analysis = await getAnalysisForViewer(id, await getViewer());
  if (!analysis) return apiError(404, "NOT_FOUND", "Analysis not found.");

  const existing = parseInsights(analysis);
  if (existing) return NextResponse.json({ insights: existing });

  try {
    const insights = await generateInsights(parsePredictions(analysis));
    await prisma.analysis.update({ where: { id }, data: { insights } });
    return NextResponse.json({ insights });
  } catch (e) {
    console.error("[insights] generation failed", e);
    return apiError(503, "AI_UNAVAILABLE", "We couldn't generate your care guide right now. Please retry.");
  }
}
