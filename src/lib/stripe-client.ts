import { loadStripe } from '@stripe/stripe-js';

// Make sure to populate NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
