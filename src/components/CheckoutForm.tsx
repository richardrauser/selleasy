'use client';

import { useState } from 'react';
import {
    PaymentElement,
    AddressElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import styles from './CheckoutForm.module.css';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/listings`,
            },
            redirect: 'if_required', // Handle redirect manually if we want, but 'if_required' usually allows staying on page if not needed (e.g. 3DS). 
            // Usually 'always' is better for simple flows but 'if_required' keeps us in SPA if possible. 
            // However, confirmPayment usually redirects if successful for standard flows unless redirect: 'if_required'.
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else {
            setIsSuccess(true);
            setIsLoading(false);
            // Optionally redirect or show success message
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.successMessage}>
                <h2>Payment Successful!</h2>
                <p>Thank you for your purchase.</p>
            </div>
        );
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className={styles.form}>
            <h3>Shipping Details</h3>
            <AddressElement options={{ mode: 'shipping' }} />

            <h3>Payment Details</h3>
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <button disabled={isLoading || !stripe || !elements} id="submit" className={styles.button}>
                {isLoading ? "Processing..." : "Pay now"}
            </button>

            {message && <div id="payment-message" className={styles.errorMessage}>{message}</div>}
        </form>
    );
}
