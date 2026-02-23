import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const {
      amount,
      currency = 'usd',
      shippingAddress,
      paymentMethod,
      billingAddress,
      itemIds,
      shippingFee,
      couponCode,
      couponDiscount,
      couponType,
      verificationDiscount,
      verificationDiscountSource,
    } = await request.json();

    // Security: $5 verification discount is one-time per user (by userId), even if they change phone/email and re-verify
    if (verificationDiscount && Number(verificationDiscount) > 0) {
      const alreadyUsed = await UsedVerificationDiscount.findOne({ user: userId });
      if (alreadyUsed) {
        return NextResponse.json(
          {
            error: 'Verification discount has already been used for this account. It cannot be applied again.',
            code: 'VERIFICATION_DISCOUNT_ALREADY_USED',
          },
          { status: 400 }
        );
      }
    }

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

    // Prepare payment intent data with BNPL support
    const paymentIntentData: any = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        userId: userId.toString(), // Ensure userId is a string
        // Store order-related data in metadata for webhook to create order
        ...(shippingAddress && {
          shippingAddress: JSON.stringify(shippingAddress),
        }),
        ...(billingAddress && {
          billingAddress: JSON.stringify(billingAddress),
        }),
        ...(paymentMethod && {
          paymentMethod: paymentMethod,
        }),
        ...(itemIds && Array.isArray(itemIds) && itemIds.length > 0 && {
          itemIds: JSON.stringify(itemIds),
        }),
        ...(shippingFee != null && shippingFee > 0 && {
          shippingFee: shippingFee.toString(),
        }),
        ...(couponCode && {
          couponCode: couponCode,
        }),
        ...(couponDiscount && {
          couponDiscount: couponDiscount.toString(),
        }),
        ...(couponType && {
          couponType: couponType,
        }),
        ...(verificationDiscount && verificationDiscount > 0 && {
          verificationDiscount: verificationDiscount.toString(),
          verificationDiscountSource: verificationDiscountSource || '',
        }),
      },
    };

    // Configure payment methods based on selected payment method
    if (paymentMethod === 'afterpay') {
      // Explicitly enable Afterpay when selected - only Afterpay, no card
      // Note: Cannot use automatic_payment_methods with payment_method_types
      // Afterpay requires specific configuration
      paymentIntentData.payment_method_types = ['afterpay_clearpay'];
      paymentIntentData.payment_method_options = {
        afterpay_clearpay: {
          capture_method: 'manual',
        },
      };
      // Ensure currency is supported (CAD for Canada)
      if (currency.toLowerCase() === 'cad') {
        paymentIntentData.currency = 'cad';
      }
    } else {
      // Use automatic payment methods for card and other methods
      paymentIntentData.automatic_payment_methods = {
        enabled: true,
        allow_redirects: 'always', // Required for BNPL redirects (Affirm, Klarna)
      };
    }

    // Add shipping address for tax calculation if provided
    if (shippingAddress) {
      paymentIntentData.shipping = {
        name: shippingAddress.fullName,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
        phone: shippingAddress.phone,
      };
    }

    // Log before creating payment intent
    console.log('========================================');
    console.log('[create-intent API] 🆕 CREATING PAYMENT INTENT');
    console.log('========================================');
    console.log('Create Request:', {
      userId,
      amountInDollars: (amountInCents / 100).toFixed(2),
      amountInCents,
      currency,
      paymentMethod: paymentMethod || 'card',
      hasShippingAddress: !!shippingAddress,
      hasBillingAddress: !!billingAddress,
      itemIds: itemIds || 'all items',
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'), // Show call stack
    });

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    // Log available payment methods for debugging BNPL options
    console.log('[create-intent API] ✅ PAYMENT INTENT CREATED');
    console.log('Payment Intent Details:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      amountInDollars: (paymentIntent.amount / 100).toFixed(2),
      currency: paymentIntent.currency,
      payment_method_types: paymentIntent.payment_method_types,
      payment_method_options: paymentIntent.payment_method_options,
      paymentMethod: paymentMethod || 'card',
      status: paymentIntent.status,
      timestamp: new Date().toISOString(),
    });
    console.log('========================================\n');

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
