import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import axios from 'axios';
import { getOrCreateUser } from '@/lib/subscription';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ensure user exists in our database before starting checkout
        await getOrCreateUser(user);

        const { plan } = await req.json();

        let productId;

        // Map plan to product details
        // In a real app, these should be in a config or DB
        if (plan === '2days') {
            productId = process.env.DODO_PAYMENTS_PRODUCT_ID_2DAYS;
            // price = 400; 
            // productName = '2 Days Access';
        } else if (plan === '7days') {
            productId = process.env.DODO_PAYMENTS_PRODUCT_ID_7DAYS;
            // productName = '7 Days Access';
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

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorResponse = axios.isAxiosError(error) ? error.response?.data : null;

        console.error('Payment creation failed:', errorResponse || errorMessage);
        return NextResponse.json(
            { error: 'Failed to create payment session' },
            { status: 500 }
        );
    }
}
