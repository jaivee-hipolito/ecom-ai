import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { amount, currency = 'usd' } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Amount is in dollars, convert to cents
    const amountInCents = Math.round(amount * 100);
    
    if (amountInCents < 50) {
      // Minimum amount is $0.50 (50 cents)
      return NextResponse.json(
        { error: 'Amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // Get Stripe instance (will throw if not configured)
    const stripe = getStripe();

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message?.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Payment service is not configured. Please contact support.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
