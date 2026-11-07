import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PLANS, UNLIMITED_LIMIT, type PaidPlanId } from "@/lib/plans";

function isUniqueViolation(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

function activeWhere(userId: string) {
  return {
    user_id: userId,
    status: "active",
    OR: [{ expiry_date: null }, { expiry_date: { gt: new Date() } }],
  } satisfies Prisma.SubscriptionWhereInput;
}

/**
 * Make sure the Clerk user has a DB row (and their free credits).
 * Safe to call on every request; it is a single indexed lookup once the row exists.
 */
export async function ensureUser(userId: string) {
  const existing = await prisma.user.findUnique({ where: { user_id: userId } });
  if (existing) return existing;

  const client = await clerkClient();
  const cu = await client.users.getUser(userId);
  const email = cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error(`Clerk user ${userId} has no email address`);
  const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || null;

  try {
    return await prisma.user.create({
      data: {
        user_id: userId,
        email,
        name,
        subscriptions: {
          create: { plan_type: "free", predictions_limit: PLANS.free.analyses ?? 0 },
        },
      },
    });
  } catch (e) {
    // Two concurrent first requests: the other one won the race.
    if (isUniqueViolation(e)) {
      const row = await prisma.user.findUnique({ where: { user_id: userId } });
      if (row) return row;
    }
    throw e;
  }
}

export interface CreditSummary {
  remaining: number;
  unlimitedUntil: Date | null;
  nextExpiry: Date | null;
}

export async function getCreditSummary(userId: string): Promise<CreditSummary> {
  const subs = await prisma.subscription.findMany({ where: activeWhere(userId) });
  let remaining = 0;
  let unlimitedUntil: Date | null = null;
  let nextExpiry: Date | null = null;

  for (const s of subs) {
    const left = Math.max(0, s.predictions_limit - s.predictions_used);
    if (s.predictions_limit >= UNLIMITED_LIMIT && s.expiry_date) {
      if (!unlimitedUntil || s.expiry_date > unlimitedUntil) unlimitedUntil = s.expiry_date;
    } else {
      remaining += left;
    }
    if (left > 0 && s.expiry_date && (!nextExpiry || s.expiry_date < nextExpiry)) nextExpiry = s.expiry_date;
  }
  return { remaining, unlimitedUntil, nextExpiry };
}

/**
 * Atomically take one credit, preferring the bucket that expires soonest.
 * Returns the subscription id that was charged, or null if the user has no credits.
 */
export async function consumeCredit(userId: string): Promise<string | null> {
  const candidates = await prisma.subscription.findMany({
    where: activeWhere(userId),
    orderBy: [{ expiry_date: { sort: "asc", nulls: "last" } }, { purchase_date: "asc" }],
  });

  for (const s of candidates) {
    if (s.predictions_used >= s.predictions_limit) continue;
    // The WHERE re-checks the limit inside the UPDATE, so concurrent requests can't overspend.
    const { count } = await prisma.subscription.updateMany({
      where: { subscription_id: s.subscription_id, predictions_used: { lt: s.predictions_limit } },
      data: { predictions_used: { increment: 1 } },
    });
    if (count === 1) return s.subscription_id;
  }
  return null;
}

/** Give a credit back when the analysis failed for reasons that aren't the user's fault. */
export async function refundCredit(subscriptionId: string) {
  await prisma.subscription.updateMany({
    where: { subscription_id: subscriptionId, predictions_used: { gt: 0 } },
    data: { predictions_used: { decrement: 1 } },
  });
}

/** Idempotent: a retried webhook for the same payment never grants twice. */
export async function grantPlan(userId: string, plan: PaidPlanId, paymentId: string) {
  await ensureUser(userId);
  const p = PLANS[plan];
  try {
    await prisma.subscription.create({
      data: {
        user_id: userId,
        plan_type: plan,
        predictions_limit: p.analyses ?? UNLIMITED_LIMIT,
        expiry_date: p.durationDays ? new Date(Date.now() + p.durationDays * 86_400_000) : null,
        payment_id: paymentId,
      },
    });
    return { granted: true };
  } catch (e) {
    if (isUniqueViolation(e)) return { granted: false };
    throw e;
  }
}
