import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStripe } from '@/lib/stripe';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import UsedCoupon from '@/models/UsedCoupon';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Get Stripe instance
    const stripe = getStripe();

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data.billing_details'],
    });

    const metadata = paymentIntent.metadata || {};

    // Check if order already exists
    const existingOrder = await Order.findOne({ paymentId: paymentIntentId });
    if (existingOrder) {
      return NextResponse.json({
        ...existingOrder.toObject(),
        _id: existingOrder._id.toString(),
        user: existingOrder.user.toString(),
      });
    }

    // Validate required metadata
    if (!metadata.userId || !metadata.shippingAddress) {
      return NextResponse.json(
        { error: 'Payment intent metadata is incomplete' },
        { status: 400 }
      );
    }

    // Verify userId matches (compare as strings)
    if (metadata.userId !== userId.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized - payment intent belongs to different user' },
        { status: 403 }
      );
    }

    const shippingAddress = JSON.parse(metadata.shippingAddress);
    // Detect payment method from payment intent's actual payment method types, not just metadata
    const actualPaymentMethodType = paymentIntent.payment_method_types?.[0];
    let paymentMethod = metadata.paymentMethod || 'card';
    
    // Override with actual payment method if detected
    if (actualPaymentMethodType === 'card') {
      paymentMethod = 'card';
    } else if (actualPaymentMethodType === 'afterpay_clearpay' || actualPaymentMethodType === 'afterpay') {
      paymentMethod = 'afterpay';
    } else if (actualPaymentMethodType === 'affirm') {
      paymentMethod = 'affirm';
    } else if (actualPaymentMethodType === 'klarna') {
      paymentMethod = 'klarna';
    }
    
    console.log('[create-from-intent] Payment method detection:', {
      metadataPaymentMethod: metadata.paymentMethod,
      actualPaymentMethodType,
      detectedPaymentMethod: paymentMethod,
      paymentIntentAmount: paymentIntent.amount,
      paymentIntentAmountInDollars: (paymentIntent.amount / 100).toFixed(2),
    });
    
    const itemIds = metadata.itemIds ? JSON.parse(metadata.itemIds) : null;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'No matching items found in cart' },
        { status: 400 }
      );
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
    
    let finalTotalAmount: number;
    
    if (isBNPL) {
      // For BNPL payments: Order total = subtotal (without BNPL fee)
      // Payment intent charges subtotal + 6% fee, but order total shows subtotal only
      finalTotalAmount = totalAmount; // Don't add BNPL fee to order total
      
      console.log('[create-from-intent] BNPL payment - Order total without fee:', {
        paymentMethod,
        subtotal: totalAmount,
        bnplFee: totalAmount * BNPL_FEE_RATE,
        paymentIntentCharges: paymentIntent.amount / 100, // What Stripe charges (includes fee)
        orderTotal: finalTotalAmount, // What order shows (without fee)
        paymentIntentId,
        note: 'BNPL fee is charged by Stripe but not included in order total',
      });
    } else {
      // For card payments, use the actual payment intent amount (which we corrected to remove BNPL fee)
      // This ensures the order total matches what was actually charged
      const paymentIntentAmountInDollars = paymentIntent.amount / 100;
      finalTotalAmount = paymentIntentAmountInDollars;
      
      console.log('[create-from-intent] Using payment intent amount for card payment:', {
        paymentMethod,
        calculatedTotal: totalAmount,
        paymentIntentAmount: paymentIntentAmountInDollars,
        finalTotalAmount,
        paymentIntentId,
      });
    }

    // Create order
    const orderData: any = {
      user: userId,
      items: orderItems,
      totalAmount: finalTotalAmount,
      shippingAddress,
      paymentMethod,
      paymentId: paymentIntentId,
      paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending',
      status: 'pending',
    };

    // Add billing address if available
    if (metadata.billingAddress) {
      orderData.billingAddress = JSON.parse(metadata.billingAddress);
    } else {
      // Try to get billing address from expanded charges
      const expandedPaymentIntent = paymentIntent as any;
      if (expandedPaymentIntent.charges?.data?.[0]?.billing_details) {
        const billingDetails = expandedPaymentIntent.charges.data[0].billing_details;
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
    }

    const order = await Order.create(orderData) as any;

    // Save used coupon if one was applied
    const couponCode = metadata.couponCode;
    const couponDiscount = metadata.couponDiscount ? parseFloat(metadata.couponDiscount) : undefined;
    const couponType = metadata.couponType as 'percentage' | 'fixed' | undefined;

    if (couponCode && couponDiscount && couponType) {
      try {
        await UsedCoupon.create({
          user: userId,
          couponCode: couponCode.toUpperCase(),
          discount: couponDiscount,
          discountType: couponType,
          orderId: order._id,
          usedAt: new Date(),
        });
        console.log(`[create-from-intent] Saved used coupon: ${couponCode} for user ${userId}`);
      } catch (error: any) {
        // Log error but don't fail order creation if coupon save fails
        console.error('Error saving used coupon:', error);
        // If it's a duplicate key error, coupon was already used - this shouldn't happen but log it
        if (error.code === 11000) {
          console.warn(`[create-from-intent] Coupon ${couponCode} was already used by user ${userId}`);
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

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .lean();

    return NextResponse.json(
      {
        ...populatedOrder!,
        _id: populatedOrder!._id.toString(),
        user: populatedOrder!.user.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order from payment intent:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create order from payment intent' },
      { status: 500 }
    );
  }
}

