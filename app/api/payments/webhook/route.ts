import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import UsedCoupon from '@/models/UsedCoupon';
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
        const paymentIntentId = paymentIntentSucceeded.id;
        const metadata = paymentIntentSucceeded.metadata || {};
        const userId = metadata.userId;
        
        console.log('Webhook received - payment_intent.succeeded:', {
          paymentIntentId,
          userId,
          hasShippingAddress: !!metadata.shippingAddress,
          hasItemIds: !!metadata.itemIds,
          metadataKeys: Object.keys(metadata),
        });

        // Check if order already exists
        let existingOrder = await Order.findOne({ paymentId: paymentIntentId });

        if (existingOrder) {
          // Update existing order
          await Order.updateOne(
            { paymentId: paymentIntentId },
            {
              $set: {
                paymentStatus: 'paid',
                status: 'processing',
              },
            }
          );
          console.log('Order updated - PaymentIntent succeeded:', paymentIntentId);
        } else if (userId && metadata.shippingAddress) {
          // Create order from metadata (for redirect-based payments like Afterpay)
          try {
            const shippingAddress = JSON.parse(metadata.shippingAddress);
            const paymentMethod = metadata.paymentMethod || 'card';
            const itemIds = metadata.itemIds ? JSON.parse(metadata.itemIds) : null;
            
            // Convert userId string to ObjectId for MongoDB query
            const mongoose = require('mongoose');
            const userIdObjectId = mongoose.Types.ObjectId.isValid(userId) 
              ? new mongoose.Types.ObjectId(userId) 
              : userId;
            
            // Get user's cart
            const cart = await Cart.findOne({ user: userIdObjectId }).populate('items.product');
            
            if (cart && cart.items && cart.items.length > 0) {
              // Filter items if itemIds is provided
              let itemsToProcess = cart.items;
              if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
                const itemIdsSet = new Set(itemIds.map((id: string) => id.toString()));
                itemsToProcess = cart.items.filter((item: any) => {
                  const productId = item.product._id ? item.product._id.toString() : item.product.toString();
                  return itemIdsSet.has(productId);
                });
              }
              
              if (itemsToProcess.length === 0) {
                console.warn('No items to process for order creation from webhook');
                break;
              }
              
              // Calculate total and prepare order items
              let totalAmount = 0;
              const orderItems = [];
              const productIdsToRemove = new Set<string>();

              for (const item of itemsToProcess) {
                const product = item.product as any;
                
                if (!product || !product._id) {
                  continue; // Skip invalid items
                }

                const productId = product._id.toString();
                productIdsToRemove.add(productId);

                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;

                orderItems.push({
                  product: product._id,
                  name: product.name,
                  quantity: item.quantity,
                  price: product.price,
                  image: product.coverImage || (product.images && product.images[0]) || '',
                });
              }

              // IMPORTANT: Order totalAmount should NOT include BNPL fee
              // BNPL fee (6%) is charged by Stripe in the payment intent, but order total should show subtotal only
              const BNPL_FEE_RATE = 0.06; // 6%
              const isBNPL = paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm';
              
              // Order total is subtotal only (without BNPL fee)
              // Payment intent charges subtotal + 6% fee, but order total shows subtotal only
              const orderTotalAmount = totalAmount; // Don't add BNPL fee to order total
              
              if (isBNPL) {
                console.log('[webhook] BNPL payment - Order total without fee:', {
                  paymentMethod,
                  subtotal: totalAmount,
                  bnplFee: totalAmount * BNPL_FEE_RATE,
                  paymentIntentCharges: paymentIntentSucceeded.amount / 100, // What Stripe charges (includes fee)
                  orderTotal: orderTotalAmount, // What order shows (without fee)
                  paymentIntentId,
                  note: 'BNPL fee is charged by Stripe but not included in order total',
                });
              }

              // Create order
              const orderData: any = {
                user: userId,
                items: orderItems,
                totalAmount: orderTotalAmount,
                shippingAddress,
                paymentMethod,
                paymentId: paymentIntentId,
                paymentStatus: 'paid',
                status: 'processing',
              };

              // Add billing address if available in metadata or payment intent
              if (metadata.billingAddress) {
                orderData.billingAddress = JSON.parse(metadata.billingAddress);
              } else if (paymentIntentSucceeded.charges?.data?.[0]?.billing_details) {
                // Get billing address from payment intent's charge billing_details
                const billingDetails = paymentIntentSucceeded.charges.data[0].billing_details;
                if (billingDetails.address) {
                  orderData.billingAddress = {
                    fullName: billingDetails.name || shippingAddress.fullName,
                    address: billingDetails.address.line1 || '',
                    city: billingDetails.address.city || '',
                    state: billingDetails.address.state || '',
                    zipCode: billingDetails.address.postal_code || '',
                    country: billingDetails.address.country || shippingAddress.country,
                  };
                }
              }

              const order = await Order.create(orderData) as any;

              // Save used coupon if one was applied
              const couponCode = metadata.couponCode;
              const couponDiscount = metadata.couponDiscount ? parseFloat(metadata.couponDiscount) : undefined;
              const couponType = metadata.couponType as 'percentage' | 'fixed' | undefined;

              if (couponCode && couponDiscount && couponType) {
                try {
                  await UsedCoupon.create({
                    user: userIdObjectId,
                    couponCode: couponCode.toUpperCase(),
                    discount: couponDiscount,
                    discountType: couponType,
                    orderId: order._id,
                    usedAt: new Date(),
                  });
                  console.log(`[webhook] Saved used coupon: ${couponCode} for user ${userId}`);
                } catch (error: any) {
                  // Log error but don't fail order creation if coupon save fails
                  console.error('Error saving used coupon in webhook:', error);
                  // If it's a duplicate key error, coupon was already used - this shouldn't happen but log it
                  if (error.code === 11000) {
                    console.warn(`[webhook] Coupon ${couponCode} was already used by user ${userId}`);
                  }
                }
              }

              // Remove ordered items from cart
              cart.items = cart.items.filter((item: any) => {
                const productId = item.product?._id 
                  ? item.product._id.toString() 
                  : item.product?.toString() || item.product?.toString();
                return !productIdsToRemove.has(productId);
              });
              
              await cart.save();
              
              console.log('Order created from webhook - PaymentIntent succeeded:', paymentIntentId, 'Order ID:', order._id);
            } else {
              console.warn('Cart is empty for user', userId, '- cannot create order from webhook');
            }
          } catch (createError: any) {
            console.error('Error creating order from webhook:', createError);
            // Don't fail the webhook - log error but continue
          }
        } else {
          console.warn('Cannot create order from webhook - missing userId or shippingAddress in metadata:', {
            userId,
            hasShippingAddress: !!metadata.shippingAddress,
            paymentIntentId,
          });
        }
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
