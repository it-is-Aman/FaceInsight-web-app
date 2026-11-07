import { z } from "zod";
import { getAnalysisForViewer, parsePredictions } from "@/lib/analyses.server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { streamChatReply } from "@/lib/gemini";
import { CHAT_LIMIT_PER_ANALYSIS } from "@/lib/plans";
import { getViewer } from "@/lib/viewer";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ message: z.string().trim().min(1).max(1000) });
const HISTORY_WINDOW = 12;

export async function POST(req: Request, ctx: RouteContext<"/api/analyses/[id]/chat">) {
  const viewer = await getViewer();
  if (!viewer.userId) {
    return apiError(401, "SIGN_IN_REQUIRED", "Sign in to ask follow-up questions. It's free.");
  }

  const { id } = await ctx.params;
  const analysis = await getAnalysisForViewer(id, viewer);
  if (!analysis) return apiError(404, "NOT_FOUND", "Analysis not found.");

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return apiError(400, "BAD_REQUEST", "Please type a question (max 1000 characters).");

  const asked = await prisma.chatMessage.count({ where: { analysis_id: id, role: "user" } });
  if (asked >= CHAT_LIMIT_PER_ANALYSIS) {
    return apiError(429, "RATE_LIMITED", `You've reached the ${CHAT_LIMIT_PER_ANALYSIS}-question limit for this analysis.`);
  }

  const userMessage = await prisma.chatMessage.create({
    data: { analysis_id: id, role: "user", content: body.data.message },
  });
  const recent = await prisma.chatMessage.findMany({
    where: { analysis_id: id },
    orderBy: { created_at: "desc" },
    take: HISTORY_WINDOW,
    select: { role: true, content: true },
  });
  const history = recent.reverse().map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const predictions = parsePredictions(analysis);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reply = "";
      try {
        for await (const chunk of streamChatReply(predictions, history)) {
          reply += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
        if (!reply.trim()) throw new Error("empty reply");
        await prisma.chatMessage.create({ data: { analysis_id: id, role: "assistant", content: reply } });
        controller.close();
      } catch (e) {
        console.error("[chat] stream failed", e);
        // Don't count a failed question against the limit.
        await prisma.chatMessage.delete({ where: { id: userMessage.id } }).catch(() => {});
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Questions-Remaining": String(CHAT_LIMIT_PER_ANALYSIS - asked - 1),
    },
  });
}
