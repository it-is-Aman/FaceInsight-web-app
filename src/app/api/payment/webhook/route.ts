import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/subscription';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        // TODO: Verify webhook signature in production
        // You MUST verify the Dodo Payments webhook signature for security

        const { type, data } = payload;

        if (type === 'payment.succeeded' || type === 'checkout.session.completed') {
            const userId = data.metadata?.userId || data.customer?.customer_id;
            const plan = data.metadata?.plan;
            const paymentId = data.payment_id || data.id;

            if (userId && plan) {
                // Create subscription in database
                // We assume user already exists in DB from checkout initiation
                await createSubscription(userId, plan, paymentId);

                console.log(`Created subscription for user ${userId} with plan ${plan}`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
