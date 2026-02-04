export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

if (!STRIPE_CONFIG.publishableKey && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

if (!STRIPE_CONFIG.secretKey && typeof window === 'undefined') {
  console.warn('STRIPE_SECRET_KEY is not set');
}
