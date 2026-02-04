import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import Order from '@/models/Order';
import { STRIPE_CONFIG } from '@/config/stripe';

// Force Node.js runtime for webhook
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as any;
        // Update order payment status
        await Order.updateOne(
          { paymentId: paymentIntentSucceeded.id },
          {
            $set: {
              paymentStatus: 'paid',
              status: 'processing',
            },
          }
        );
        console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as any;
        // Update order payment status
        await Order.updateOne(
          { paymentId: paymentIntentFailed.id },
          {
            $set: {
              paymentStatus: 'failed',
            },
          }
        );
        console.log('PaymentIntent failed:', paymentIntentFailed.id);
        break;

      case 'charge.refunded':
        const chargeRefunded = event.data.object as any;
        // Update order payment status
        await Order.updateOne(
          { paymentId: chargeRefunded.payment_intent },
          {
            $set: {
              paymentStatus: 'refunded',
            },
          }
        );
        console.log('Charge refunded:', chargeRefunded.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
