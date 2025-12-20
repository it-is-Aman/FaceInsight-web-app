import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { signGuestToken, verifyGuestToken } from '@/lib/jwt';
import { getOrCreateUser, canUserPredict, incrementPredictionCount, recordPrediction } from '@/lib/subscription';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        // 1. Check Guest Limit if not logged in
        let currentCount = 0;

        if (!userId) {
            const token = req.headers.get('x-guest-token');
            if (token) {
                const payload = await verifyGuestToken(token);
                if (payload) {
                    currentCount = payload.count;
                }
            }

            if (currentCount >= 1) {
                return NextResponse.json({ error: 'Guest limit reached. Please login.' }, { status: 403 });
            }
        } else {
            // Logged-in user: Check database subscription
            const user = await currentUser();
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 401 });
            }

            // Ensure user exists in database
            await getOrCreateUser(user);

            // Check if user can predict
            const { canPredict } = await canUserPredict(userId);

            if (!canPredict) {
                return NextResponse.json(
                    {
                        error: 'No predictions remaining. Please purchase a plan.',
                        remainingPredictions: 0
                    },
                    { status: 403 }
                );
            }
        }

        // 2. Forward to ML Service
        const formData = await req.formData();
        const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL;

        if (!mlServiceUrl) {
            return NextResponse.json({ error: 'ML Service URL not configured' }, { status: 500 });
        }

        const response = await fetch(`${mlServiceUrl}/predict`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { error: errorText || 'ML Service Error' };
            }
            return NextResponse.json(errorJson, { status: response.status });
        }

        const data = await response.json();

        // 3. Record prediction and update counts
        if (userId) {
            // Increment prediction count for logged-in users
            await incrementPredictionCount(userId);

            // Record prediction in history
            await recordPrediction(userId, data.predictions || data);
        }

        // 4. Generate New Guest Token if guest
        let newToken = null;
        if (!userId) {
            newToken = await signGuestToken({ count: currentCount + 1 });
        }

        return NextResponse.json({
            ...data,
            guestToken: newToken
        });

    } catch (error) {
        console.error('Prediction Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
