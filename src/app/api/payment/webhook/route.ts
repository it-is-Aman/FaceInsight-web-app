import { NextResponse } from "next/server";
import { grantPlan } from "@/lib/credits";
import { prisma } from "@/lib/db";
import { dodo } from "@/lib/dodo";
import { isPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * Dodo Payments webhook (Standard Webhooks signature).
 * Configure the endpoint in the Dodo dashboard as https://<app>/api/payment/webhook
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: ReturnType<ReturnType<typeof dodo>["webhooks"]["unwrap"]>;
  try {
    // Throws unless the webhook-signature header matches DODO_PAYMENTS_WEBHOOK_KEY.
    event = dodo().webhooks.unwrap(raw, { headers });
  } catch (e) {
    console.warn("[webhook] rejected: invalid signature", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  try {
    switch (event.type) {
      case "payment.succeeded": {
        const { metadata, payment_id } = event.data;
        const userId = metadata?.userId;
        const plan = metadata?.plan;
        if (typeof userId !== "string" || !userId || !isPaidPlan(plan)) {
          console.warn("[webhook] payment without usable metadata", payment_id);
          break;
        }
        const { granted } = await grantPlan(userId, plan, payment_id);
        console.info(`[webhook] ${payment_id} → ${plan} for ${userId} (${granted ? "granted" : "duplicate"})`);
        break;
      }
      case "refund.succeeded": {
        await prisma.subscription.updateMany({
          where: { payment_id: event.data.payment_id },
          data: { status: "refunded" },
        });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    // 5xx makes Dodo retry; grantPlan is idempotent so retries are safe.
    console.error("[webhook] handler failed", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }
}
