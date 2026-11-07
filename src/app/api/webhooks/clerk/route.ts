import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Clerk → app sync. Configure in Clerk dashboard → Webhooks with events `user.updated` and `user.deleted`,
 * and set CLERK_WEBHOOK_SIGNING_SECRET.
 */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  switch (evt.type) {
    case "user.deleted":
      // Cascades to subscriptions, analyses and chat messages.
      if (evt.data.id) await prisma.user.deleteMany({ where: { user_id: evt.data.id } });
      break;
    case "user.updated": {
      const primary = evt.data.email_addresses.find((e) => e.id === evt.data.primary_email_address_id);
      const name = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") || null;
      await prisma.user.updateMany({
        where: { user_id: evt.data.id },
        data: { name, ...(primary ? { email: primary.email_address } : {}) },
      });
      break;
    }
  }
  return NextResponse.json({ received: true });
}
