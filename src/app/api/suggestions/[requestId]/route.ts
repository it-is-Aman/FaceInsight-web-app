import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL;

        const requestId = (await params).requestId;

        if (!mlServiceUrl) {
            return NextResponse.json(
                { error: 'ML Service URL not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${mlServiceUrl}/suggestions/${requestId}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json(
                { error: text || 'ML service error' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        console.error('Suggestions Proxy Error:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
