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
    const { paymentIntentId, amount } = await request.json();

    if (!paymentIntentId || !amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Payment Intent ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Amount is in cents
    const amountInCents = Math.round(amount);

    // Get Stripe instance
    const stripe = getStripe();

    // Retrieve the payment intent to verify it exists and belongs to the user
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify the payment intent belongs to the user (check metadata)
    if (paymentIntent.metadata.userId !== userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - payment intent belongs to different user' },
        { status: 403 }
      );
    }

    // Check if payment intent can be updated (must not be succeeded or canceled)
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'canceled') {
      return NextResponse.json(
        { error: `Cannot update payment intent with status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Extract payment method from metadata
    const paymentMethodFromMetadata = paymentIntent.metadata.paymentMethod || 'unknown';
    const paymentMethodTypes = paymentIntent.payment_method_types || [];
    const hasAffirm = paymentMethodTypes.includes('affirm');
    const hasKlarna = paymentMethodTypes.includes('klarna');
    const hasAfterpay = paymentMethodTypes.includes('afterpay_clearpay') || paymentMethodTypes.includes('afterpay');
    const hasCard = paymentMethodTypes.includes('card');
    const hasExplicitBNPLMethods = hasAffirm || hasKlarna || hasAfterpay;
    const usesAutomaticPaymentMethods = !paymentMethodTypes || 
                                       paymentMethodTypes.length === 0 ||
                                       (paymentIntent as any).automatic_payment_methods?.enabled === true;
    
    const amountDifference = paymentIntent.amount - amountInCents;
    const amountDifferenceInDollars = (amountDifference / 100).toFixed(2);
    const isBNPLFeeRemoval = amountDifference > 0; // If old amount > new amount, we're removing BNPL fee
    
    // Determine payment method type for logging
    const isExplicitBNPL = paymentMethodFromMetadata === 'afterpay' || paymentMethodFromMetadata === 'klarna' || paymentMethodFromMetadata === 'affirm';
    const isCardPaymentFromMetadata = paymentMethodFromMetadata === 'card' && !hasExplicitBNPLMethods;
    
    // Log update request with comprehensive payment method information
    console.log('========================================');
    console.log('[update-intent API] 🔄 UPDATING PAYMENT INTENT');
    console.log('========================================');
    console.log('Payment Intent Details:', {
      paymentIntentId,
      paymentMethodFromMetadata,
      paymentMethodTypes: paymentMethodTypes,
      usesAutomaticPaymentMethods,
      hasCard,
      hasAffirm,
      hasKlarna,
      hasAfterpay,
      hasExplicitBNPLMethods,
      isExplicitBNPL,
      isCardPaymentFromMetadata,
      paymentIntentStatus: paymentIntent.status,
      attachedPaymentMethod: paymentIntent.payment_method ? (typeof paymentIntent.payment_method === 'object' ? paymentIntent.payment_method.type : 'attached') : 'none',
      timestamp: new Date().toISOString(),
    });
    console.log('Update Request Details:', {
      paymentIntentId,
      oldAmountInCents: paymentIntent.amount,
      oldAmountInDollars: (paymentIntent.amount / 100).toFixed(2),
      newAmountInCents: amountInCents,
      newAmountInDollars: (amountInCents / 100).toFixed(2),
      amountDifferenceInCents: amountDifference,
      amountDifferenceInDollars: amountDifferenceInDollars,
      isBNPLFeeRemoval,
      reason: isBNPLFeeRemoval 
        ? `Removing 6% BNPL fee (${amountDifferenceInDollars}) for card payment` 
        : 'Adjusting payment amount (not removing BNPL fee)',
      paymentMethodAnalysis: {
        metadataSays: paymentMethodFromMetadata,
        hasExplicitBNPL: hasExplicitBNPLMethods,
        usesAutomaticMethods: usesAutomaticPaymentMethods,
        shouldRemoveFee: isCardPaymentFromMetadata && !hasExplicitBNPLMethods,
        actualAction: isBNPLFeeRemoval ? 'REMOVING FEE' : 'KEEPING FEE',
      },
      userId,
      timestamp: new Date().toISOString(),
    });

    // Update the payment intent amount
    const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: amountInCents,
    });

    console.log('========================================');
    console.log('[update-intent API] ✅ PAYMENT INTENT UPDATED');
    console.log('========================================');
    console.log('Updated Payment Intent:', {
      id: updatedPaymentIntent.id,
      amountInCents: updatedPaymentIntent.amount,
      amountInDollars: (updatedPaymentIntent.amount / 100).toFixed(2),
      status: updatedPaymentIntent.status,
      paymentMethod: paymentMethodFromMetadata,
      amountReduced: isBNPLFeeRemoval ? `${amountDifferenceInDollars} (BNPL fee removed)` : '0',
      timestamp: new Date().toISOString(),
    });
    console.log('========================================\n');

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: updatedPaymentIntent.id,
        amount: updatedPaymentIntent.amount,
        status: updatedPaymentIntent.status,
        client_secret: updatedPaymentIntent.client_secret,
      },
    });
  } catch (error: any) {
    console.error('[update-intent API] Error updating payment intent:', error);
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
      { error: error.message || 'Failed to update payment intent' },
      { status: 500 }
    );
  }
}

