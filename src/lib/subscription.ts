import { prisma } from './db';
import { User as ClerkUser } from '@clerk/nextjs/server';

/**
 * Get or create a user in the database from Clerk user data
 */
export async function getOrCreateUser(clerkUser: ClerkUser) {
    const userId = clerkUser.id;
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;

    if (!email) {
        throw new Error('User email is required');
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
        where: { user_id: userId },
    });

    // Create user if doesn't exist
    if (!user) {
        user = await prisma.user.create({
            data: {
                user_id: userId,
                email,
                name,
            },
        });
        await prisma.subscription.create({
            data: {
                user_id: userId,
                plan_type: 'free',
                predictions_limit: 1,
                predictions_used: 0,
                expiry_date: null,
                status: 'active',
                payment_id: null,
            },
        });
    }

    return user;
}

/**
 * Get active subscription for a user
 */
export async function getUserSubscription(userId: string) {
    const now = new Date();

    // Find active subscription that hasn't expired
    const subscription = await prisma.subscription.findFirst({
        where: {
            user_id: userId,
            status: 'active',
            OR: [
                { expiry_date: null }, // No expiry (unlimited)
                { expiry_date: { gte: now } }, // Not expired yet
            ],
        },
        orderBy: {
            purchase_date: 'desc', // Get most recent subscription
        },
    });

    // If subscription exists but is expired, update its status
    if (subscription && subscription.expiry_date && subscription.expiry_date < now) {
        await prisma.subscription.update({
            where: { subscription_id: subscription.subscription_id },
            data: { status: 'expired' },
        });
        return null;
    }

    return subscription;
}

/**
 * Check if user can make a prediction
 */
export async function canUserPredict(userId: string): Promise<{
    canPredict: boolean;
    remainingPredictions: number;
    subscription: unknown | null;
}> {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
        return {
            canPredict: false,
            remainingPredictions: 0,
            subscription: null,
        };
    }

    const remaining = subscription.predictions_limit - subscription.predictions_used;

    return {
        canPredict: remaining > 0,
        remainingPredictions: remaining,
        subscription,
    };
}

/**
 * Increment prediction count for user's active subscription
 */
export async function incrementPredictionCount(userId: string) {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
        throw new Error('No active subscription found');
    }

    await prisma.subscription.update({
        where: { subscription_id: subscription.subscription_id },
        data: {
            predictions_used: {
                increment: 1,
            },
        },
    });
}

/**
 * Create a new subscription after successful payment
 */
export async function createSubscription(
    userId: string,
    plan: string,
    paymentId: string
) {
    let predictionsLimit = 0;
    let expiryDate: Date | null = null;

    // Set limits based on plan
    if (plan === '2days') {
        predictionsLimit = 50; // Reasonable limit for 2 days
        expiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    } else if (plan === '7days') {
        predictionsLimit = 999999; // Effectively unlimited for 7 days
        expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const subscription = await prisma.subscription.create({
        data: {
            user_id: userId,
            plan_type: plan,
            predictions_limit: predictionsLimit,
            predictions_used: 0,
            expiry_date: expiryDate,
            status: 'active',
            payment_id: paymentId,
        },
    });

    return subscription;
}
/**
 * Record a prediction in history
 */
export async function recordPrediction(
    userId: string,
    predictionResult: string,
    imageUrl?: string
) {
    await prisma.predictionHistory.create({
        data: {
            user_id: userId,
            prediction_result: JSON.stringify(predictionResult),
            image_url: imageUrl || null,
        },
    });
}
