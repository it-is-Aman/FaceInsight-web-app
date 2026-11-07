import "server-only";
import { prisma } from "@/lib/db";
import { predictionsSchema, insightsSchema, type ChatMessageDTO } from "@/lib/analysis";
import type { Viewer } from "@/lib/viewer";

export async function getAnalysisForViewer(id: string, viewer: Viewer) {
  const row = await prisma.analysis.findUnique({ where: { id } });
  if (!row) return null;
  const owns =
    (row.user_id !== null && row.user_id === viewer.userId) ||
    (row.guest_id !== null && row.guest_id === viewer.guestId);
  return owns ? row : null;
}

export type AnalysisRow = NonNullable<Awaited<ReturnType<typeof getAnalysisForViewer>>>;

export function parsePredictions(row: AnalysisRow) {
  return predictionsSchema.parse(row.predictions);
}

export function parseInsights(row: AnalysisRow) {
  const parsed = insightsSchema.safeParse(row.insights);
  return parsed.success ? parsed.data : null;
}

export async function getChatMessages(analysisId: string): Promise<ChatMessageDTO[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { analysis_id: analysisId },
    orderBy: { created_at: "asc" },
    select: { id: true, role: true, content: true },
  });
  return rows.map((r) => ({ ...r, role: r.role === "assistant" ? "assistant" : "user" }));
}
