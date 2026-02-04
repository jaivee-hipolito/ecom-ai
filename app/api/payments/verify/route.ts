import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { paymentIntentId, orderId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Get Stripe instance
    const stripe = getStripe();

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    let order = null;

    // If orderId is provided, verify and update the order
    if (orderId) {
      order = await Order.findOne({
        _id: orderId,
        user: userId,
      });

      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Update order payment status based on payment intent status
      if (paymentIntent.status === 'succeeded') {
        order.paymentStatus = 'paid';
        order.paymentId = paymentIntentId;
        await order.save();
      } else if (paymentIntent.status === 'canceled') {
        order.paymentStatus = 'failed';
        await order.save();
      }
    } else {
      // If no orderId, try to find order by paymentId
      order = await Order.findOne({
        paymentId: paymentIntentId,
        user: userId,
      });

      if (order) {
        // Update order payment status based on payment intent status
        if (paymentIntent.status === 'succeeded') {
          order.paymentStatus = 'paid';
          await order.save();
        } else if (paymentIntent.status === 'canceled') {
          order.paymentStatus = 'failed';
          await order.save();
        }
      }
    }

    return NextResponse.json({
      success: paymentIntent.status === 'succeeded',
      paymentStatus: paymentIntent.status,
      order: order
        ? {
            ...order.toObject(),
            _id: order._id.toString(),
            user: order.user.toString(),
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
