import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/config/stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!STRIPE_CONFIG.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2025-11-17.clover' as any,
      typescript: true,
    });
  }

  return stripeInstance;
}

// Lazy getter for default export - only throws when actually used
export function getDefaultStripe(): Stripe {
  return getStripe();
}

// For backward compatibility, but will throw if used without key
export default getDefaultStripe;
