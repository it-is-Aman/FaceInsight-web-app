import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { signGuestToken, verifyGuestToken } from '@/lib/jwt';

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
        }

        // 2. Forward to ML Service
        const formData = await req.formData();
        const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL;

        if (!mlServiceUrl) {
            return NextResponse.json({ error: 'ML Service URL not configured' }, { status: 500 });
        }

        // We need to construct a new FormData to forward, or pass the incoming one?
        // fetch accepts the FormData from req.formData() directly.

        const response = await fetch(`${mlServiceUrl}/predict`, {
            method: 'POST',
            body: formData,
            // Note: Do NOT set Content-Type header when sending FormData, 
            // the browser/fetch will set it with the boundary.
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                errorJson = { error: errorText || 'ML Service Error' };
            }
            return NextResponse.json(errorJson, { status: response.status });
        }

        const data = await response.json();

        // 3. Generate New Guest Token if guest
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
