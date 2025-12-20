'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { canUserPredict, getOrCreateUser } from '@/lib/subscription';

export async function checkSubscriptionStatus() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return {
            isLoggedIn: false,
            canPredict: false,
            remainingPredictions: 0,
        };
    }

    // Ensure user exists in DB
    await getOrCreateUser(user);

    const status = await canUserPredict(userId);

    return {
        isLoggedIn: true,
        ...status,
    };
}
