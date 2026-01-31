'use server';

import Stripe from 'stripe';
import { getListing } from './get-listing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createPaymentIntent(listingId: string) {
    try {
        const listingResult = await getListing(listingId);

        if (!listingResult.success || !listingResult.data) {
            return { success: false, error: 'Listing not found' };
        }

        const listing = listingResult.data;

        // Ensure price is valid
        const price = parseFloat(listing.chosenPrice);
        if (isNaN(price)) {
            return { success: false, error: 'Invalid listing price' };
        }

        const amount = Math.round(price * 100); // Convert to cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                listingId: listing.id,
                listingTitle: listing.title,
            },
        });

        return { success: true, clientSecret: paymentIntent.client_secret };

    } catch (error) {
        console.error('Error creating payment intent:', error);
        return { success: false, error: 'Failed to create payment intent' };
    }
}
