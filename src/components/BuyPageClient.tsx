'use client';

import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe-client';
import CheckoutForm from './CheckoutForm';
import { createPaymentIntent } from '@/app/actions/create-payment-intent';
import { Listing } from '@/app/actions/get-listings';
import styles from '@/app/listings/[id]/buy/page.module.css';

interface BuyPageClientProps {
    listing: Listing;
    negotiatedPrice?: string;
}

export default function BuyPageClient({ listing, negotiatedPrice }: BuyPageClientProps) {
    const [clientSecret, setClientSecret] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const displayPrice = negotiatedPrice || listing.chosenPrice;

    useEffect(() => {
        const initPayment = async () => {
            const result = await createPaymentIntent(listing.id, negotiatedPrice);
            if (result.success && result.clientSecret) {
                setClientSecret(result.clientSecret);
            } else {
                setError(result.error || "Failed to initialize payment");
            }
        };

        initPayment();
    }, [listing.id, negotiatedPrice]);

    const appearance = {
        theme: 'stripe' as const,
    };

    const options = {
        clientSecret,
        appearance,
    };

    if (error) {
        return <div className={styles.container}><p className={styles.loading}>Error: {error}</p></div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Checkout</h1>
            </header>

            <div className={styles.summary}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                <div className={styles.summaryItem}>
                    <span>{listing.title}</span>
                    <span>${displayPrice}</span>
                </div>
                <div className={styles.total}>
                    <span>Total</span>
                    <span>${displayPrice}</span>
                </div>
            </div>

            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            ) : (
                <div className={styles.loading}>Loading payment details...</div>
            )}
        </div>
    );
}
