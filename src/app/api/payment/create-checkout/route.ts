import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await req.json();

        let productId;
        let price;
        let productName;

        // Map plan to product details
        // In a real app, these should be in a config or DB
        if (plan === '2days') {
            productId = process.env.DODO_PAYMENTS_PRODUCT_ID_2DAYS;
            price = 400; // $4.00 in cents if Dodo uses cents, or just 4 if dollars. 
            // Dodo Payments usually takes amount in smallest currency unit or just amount. 
            // Based on search, it takes product_id. So price is determined by product_id usually.
            productName = '2 Days Access';
        } else if (plan === '7days') {
            productId = process.env.DODO_PAYMENTS_PRODUCT_ID_7DAYS;
            productName = '7 Days Access';
        } else {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        if (!productId) {
            return NextResponse.json({ error: 'Product ID not configured' }, { status: 500 });
        }

        // Create Checkout Session
        const response = await axios.post(
            'https://test.dodopayments.com/checkouts', // Use test endpoint
            {
                product_cart: [
                    {
                        product_id: productId,
                        quantity: 1
                    }
                ],
                billing: {
                    city: "New York",
                    country: "US",
                    state: "NY",
                    street: "123 Main St",
                    zipcode: "10001"
                },
                customer: {
                    email: user.emailAddresses[0].emailAddress,
                    name: `${user.firstName} ${user.lastName}`
                },
                metadata: {
                    userId: userId,
                    plan: plan
                },
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/upload?payment=success`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({ url: response.data.checkout_url });

    } catch (error: any) {
        console.error('Payment creation failed:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to create payment session' },
            { status: 500 }
        );
    }
}
