import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const GUEST_COOKIE = "fi_guest";

export interface Viewer {
  userId: string | null;
  guestId: string | null;
}

/** Who is making this request: a Clerk user, an anonymous guest (cookie), or both. */
export async function getViewer(): Promise<Viewer> {
  const [{ userId }, jar] = await Promise.all([auth(), cookies()]);
  return { userId, guestId: jar.get(GUEST_COOKIE)?.value ?? null };
}

/** Returns the guest id, creating the cookie if needed (only callable from route handlers/actions). */
export async function getOrCreateGuestId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(GUEST_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return id;
}

/** Salted hash of the client IP, used only for the guest rate limit (we never store raw IPs). */
export async function getIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${env().IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32);
}

/** When a guest signs in, move their anonymous analyses onto their account. */
export async function claimGuestAnalyses(userId: string, guestId: string | null) {
  if (!guestId) return;
  await prisma.analysis.updateMany({
    where: { guest_id: guestId, user_id: null },
    data: { user_id: userId },
  });
}
