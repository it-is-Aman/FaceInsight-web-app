import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { ensureUser } from "@/lib/credits";
import { dodo, productIdFor } from "@/lib/dodo";
import { env } from "@/lib/env";
import { isPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";

const bodySchema = z.object({ plan: z.string().refine(isPaidPlan) });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return apiError(401, "SIGN_IN_REQUIRED", "Please sign in to purchase a pass.");

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success || !isPaidPlan(body.data.plan)) return apiError(400, "BAD_REQUEST", "Unknown plan.");
  const plan = body.data.plan;

  const productId = productIdFor(plan);
  if (!productId) {
    console.error(`[checkout] product id for ${plan} is not configured`);
    return apiError(500, "INTERNAL", "Payments are not configured yet.");
  }

  try {
    const user = await ensureUser(userId);
    const session = await dodo().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email, name: user.name ?? user.email },
      // Read back by the webhook; it's signed, so it can be trusted there.
      metadata: { userId, plan },
      return_url: `${env().NEXT_PUBLIC_APP_URL}/pricing?checkout=success`,
    });
    if (!session.checkout_url) throw new Error("No checkout_url in response");
    return NextResponse.json({ url: session.checkout_url });
  } catch (e) {
    console.error("[checkout] failed", e);
    return apiError(502, "INTERNAL", "Couldn't start checkout. Please try again.");
  }
}
