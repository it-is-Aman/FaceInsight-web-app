import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { ensureUser, getCreditSummary } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return apiError(401, "SIGN_IN_REQUIRED", "Not signed in.");
  await ensureUser(userId);
  const credits = await getCreditSummary(userId);
  return NextResponse.json({ credits });
}
