import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { apiError } from "@/lib/api";
import { consumeCredit, ensureUser, getCreditSummary, refundCredit } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { MlError, predict } from "@/lib/ml";
import { DAILY_ANALYSIS_LIMIT, FREE_ACCOUNT_OFFER, GUEST_DAILY_LIMIT, PAYMENTS_ENABLED } from "@/lib/plans";
import { getSample } from "@/lib/samples";
import { claimGuestAnalyses, getIpHash, getOrCreateGuestId, getViewer } from "@/lib/viewer";

export const runtime = "nodejs";
// Leaves room for a sleeping Hugging Face Space to boot.
export const maxDuration = 120;

// Vercel rejects request bodies over 4.5 MB; the client compresses well below this.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DAY_MS = 86_400_000;
const SAMPLE_DAILY_LIMIT = 30;

export async function POST(req: NextRequest) {
  const viewer = await getViewer();
  if (viewer.userId) {
    await ensureUser(viewer.userId);
    await claimGuestAnalyses(viewer.userId, viewer.guestId);
  }

  if (req.headers.get("content-type")?.includes("application/json")) {
    return createSampleAnalysis(req, viewer.userId);
  }

  // ---- 1. Validate upload ---------------------------------------------------
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return apiError(400, "BAD_REQUEST", "Please attach a photo.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return apiError(415, "UNSUPPORTED_TYPE", "Please upload a JPG, PNG or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    return apiError(413, "FILE_TOO_LARGE", "That image is too large. Please use one under 4 MB.");
  }

  // ---- 2. Check allowance ---------------------------------------------------
  let chargedSubscription: string | null = null;
  let guestId: string | null = null;
  let ipHash: string | null = null;

  if (viewer.userId) {
    chargedSubscription = await consumeCredit(viewer.userId);
    if (!chargedSubscription) {
      if (PAYMENTS_ENABLED) {
        return apiError(402, "NO_CREDITS", "You've used all your analyses. Pick a pass to keep going.");
      }
      const { resetsAt } = await getCreditSummary(viewer.userId);
      const hours = resetsAt ? Math.max(1, Math.ceil((resetsAt.getTime() - Date.now()) / 3_600_000)) : 24;
      return apiError(
        429,
        "DAILY_LIMIT",
        `You've used today's ${DAILY_ANALYSIS_LIMIT} analyses. Your next one frees up in about ${hours} ${hours === 1 ? "hour" : "hours"}.`,
      );
    }
  } else {
    guestId = await getOrCreateGuestId();
    ipHash = await getIpHash();
    const used = await prisma.analysis.count({
      where: {
        source: "upload",
        user_id: null,
        created_at: { gte: new Date(Date.now() - DAY_MS) },
        OR: [{ guest_id: guestId }, { ip_hash: ipHash }],
      },
    });
    if (used >= GUEST_DAILY_LIMIT) {
      return apiError(401, "SIGN_IN_REQUIRED", `Create a free account to get ${FREE_ACCOUNT_OFFER}.`);
    }
  }

  // ---- 3. Run the model (refund on any failure) ----------------------------
  try {
    const result = await predict(file, file.name || "photo.jpg");
    const analysis = await prisma.analysis.create({
      data: {
        user_id: viewer.userId,
        guest_id: guestId,
        ip_hash: ipHash,
        source: "upload",
        predictions: result.predictions,
        face_confidence: result.face.confidence ?? null,
        model_version: result.model_version,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: analysis.id }, { status: 201 });
  } catch (e) {
    if (chargedSubscription) await refundCredit(chargedSubscription);
    if (e instanceof MlError) return apiError(e.status, e.code, e.message);
    console.error("[analyses] unexpected error", e);
    return apiError(500, "INTERNAL", "Something went wrong. You were not charged.");
  }
}

async function createSampleAnalysis(req: NextRequest, userId: string | null) {
  const body = z.object({ sampleId: z.string() }).safeParse(await req.json().catch(() => null));
  const sample = body.success ? getSample(body.data.sampleId) : undefined;
  if (!sample) return apiError(400, "BAD_REQUEST", "Unknown sample.");

  const guestId = userId ? null : await getOrCreateGuestId();
  const ipHash = await getIpHash();
  const recent = await prisma.analysis.count({
    where: { source: "sample", ip_hash: ipHash, created_at: { gte: new Date(Date.now() - DAY_MS) } },
  });
  if (recent >= SAMPLE_DAILY_LIMIT) {
    return apiError(429, "RATE_LIMITED", "You've opened a lot of demos today. Try again tomorrow.");
  }

  // Samples are deterministic, so reuse insights generated for an earlier demo run.
  const cached = await prisma.analysis.findFirst({
    where: { sample_id: sample.id, insights: { not: Prisma.AnyNull } },
    select: { insights: true },
  });

  const analysis = await prisma.analysis.create({
    data: {
      user_id: userId,
      guest_id: guestId,
      ip_hash: ipHash,
      source: "sample",
      sample_id: sample.id,
      predictions: sample.predictions,
      face_confidence: sample.faceConfidence,
      model_version: "sample",
      insights: (cached?.insights ?? undefined) as Prisma.InputJsonValue | undefined,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: analysis.id }, { status: 201 });
}
