import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await requireAuth(); // Ensure user is authenticated

    const { paymentIntentId, refundAmount } = await request.json();

    if (!paymentIntentId || !refundAmount) {
      return NextResponse.json(
        { error: 'Payment Intent ID and refund amount are required' },
        { status: 400 }
      );
    }

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get Stripe instance
    const stripe = getStripe();

    // Retrieve the payment intent to verify it exists and get the charge ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment intent must be succeeded to create a refund' },
        { status: 400 }
      );
    }

    // Get the latest charge from the payment intent
    const charges = await stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });

    if (charges.data.length === 0) {
      return NextResponse.json(
        { error: 'No charge found for this payment intent' },
        { status: 404 }
      );
    }

    const charge = charges.data[0];

    // Convert refund amount from dollars to cents
    const refundAmountInCents = Math.round(refundAmount * 100);

    // Create a partial refund for the BNPL fee
    const refund = await stripe.refunds.create({
      charge: charge.id,
      amount: refundAmountInCents,
      reason: 'requested_by_customer',
      metadata: {
        reason: 'BNPL fee refund - card payment',
        paymentIntentId: paymentIntentId,
      },
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to dollars
      status: refund.status,
    });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create refund' },
      { status: 500 }
    );
  }
}

