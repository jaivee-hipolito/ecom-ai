import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import UsedCoupon from '@/models/UsedCoupon';
import { deductStockForOrder, restoreStockForOrder } from '@/lib/orderStock';
import { getSelectedAttributesFromCartItem } from '@/lib/orderItemAttributes';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
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
          const wasPaid = (existingOrder as any).paymentStatus === 'paid';
          const alreadyDeducted = (existingOrder as any).stockDeducted === true;
          await Order.updateOne(
            { paymentId: paymentIntentId },
            {
              $set: {
                paymentStatus: 'paid',
                status: 'processing',
              },
            }
          );
          if (!wasPaid && !alreadyDeducted) {
            try {
              await deductStockForOrder((existingOrder as any).items || []);
              await Order.updateOne({ paymentId: paymentIntentId }, { $set: { stockDeducted: true } });
            } catch (e) {
              console.error('[webhook] Failed to deduct stock for existing order:', e);
            }
          }
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

                const selectedAttributes = getSelectedAttributesFromCartItem(item);
                orderItems.push({
                  product: product._id,
                  name: product.name,
                  quantity: item.quantity,
                  price: product.price,
                  image: product.coverImage || (product.images && product.images[0]) || '',
                  ...(selectedAttributes && Object.keys(selectedAttributes).length > 0 && { selectedAttributes }),
                });
              }

              const orderTotalAmount = paymentIntentSucceeded.amount
                ? paymentIntentSucceeded.amount / 100
                : totalAmount;
              const shippingFee = metadata.shippingFee ? parseFloat(metadata.shippingFee) : 0;

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
                ...(shippingFee > 0 && { shippingFee }),
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

              if (!order.stockDeducted) {
                try {
                  await deductStockForOrder(order.items || []);
                  await Order.updateOne({ _id: order._id }, { $set: { stockDeducted: true } });
                } catch (e) {
                  console.error('[webhook] Failed to deduct stock for new order:', e);
                }
              }

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

              // Save used verification discount (one-time $5 off for phone/email verification)
              // Security: only create record if user has not already used the discount (one per user, ever)
              const verificationDiscount = metadata.verificationDiscount
                ? parseFloat(metadata.verificationDiscount)
                : 0;
              const verificationDiscountSource = (metadata.verificationDiscountSource ||
                '') as 'phone' | 'email' | 'both';

              if (verificationDiscount > 0 && (verificationDiscountSource === 'phone' || verificationDiscountSource === 'email' || verificationDiscountSource === 'both')) {
                const alreadyUsedDiscount = await UsedVerificationDiscount.findOne({ user: userIdObjectId });
                if (!alreadyUsedDiscount) {
                  try {
                    await UsedVerificationDiscount.create({
                      user: userIdObjectId,
                      verificationType: verificationDiscountSource,
                      discount: verificationDiscount,
                      orderId: order._id,
                      usedAt: new Date(),
                    });
                    console.log(
                      `[webhook] Saved used verification discount (${verificationDiscountSource}) for user ${userId}`
                    );
                  } catch (error: any) {
                    console.error('Error saving used verification discount in webhook:', error);
                    if (error.code === 11000) {
                      console.warn(
                        `[webhook] Verification discount was already used by user ${userId}`
                      );
                    }
                  }
                } else {
                  console.warn(`[webhook] Verification discount already used by user ${userId}, skipping record`);
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
        const refundedOrder = await Order.findOne({ paymentId: chargeRefunded.payment_intent }).lean();
        await Order.updateOne(
          { paymentId: chargeRefunded.payment_intent },
          { $set: { paymentStatus: 'refunded' } }
        );
        const wasPaidForRefund = refundedOrder && (refundedOrder as any).paymentStatus === 'paid';
        const hadStockDeducted = refundedOrder && ((refundedOrder as any).stockDeducted === true || (refundedOrder as any).stockDeducted === undefined);
        const notYetRestored = refundedOrder && (refundedOrder as any).stockRestored !== true;
        if (refundedOrder && wasPaidForRefund && hadStockDeducted && notYetRestored) {
          try {
            await restoreStockForOrder((refundedOrder as any).items || []);
            await Order.updateOne(
              { paymentId: chargeRefunded.payment_intent },
              { $set: { stockRestored: true } }
            );
          } catch (e) {
            console.error('[webhook] Failed to restore stock on refund:', e);
          }
        }
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
