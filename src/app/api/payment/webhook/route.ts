import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // Verify webhook signature (Skipped for now as we don't have the SDK/Secret logic handy)
        // In production, you MUST verify the signature.

        const { type, data } = payload;

        if (type === 'payment.succeeded' || type === 'checkout.session.completed') {
            const userId = data.metadata?.userId || data.customer?.customer_id;
            const plan = data.metadata?.plan;

            if (userId && plan) {
                let durationDays = 0;
                if (plan === '2days') durationDays = 2;
                if (plan === '7days') durationDays = 7;

                const expiresAt = Date.now() + (durationDays * 24 * 60 * 60 * 1000);

                await clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        subscriptionExpiresAt: expiresAt,
                        subscriptionPlan: plan
                    }
                });

                console.log(`Updated subscription for user ${userId} to expire at ${new Date(expiresAt)}`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
