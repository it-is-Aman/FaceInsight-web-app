import { NextResponse } from "next/server";
import { wake } from "@/lib/ml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Called when the analyze page opens so a sleeping model starts booting before the upload. */
export async function GET() {
  return NextResponse.json({ awake: await wake() });
}
