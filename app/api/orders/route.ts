import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import UsedCoupon from '@/models/UsedCoupon';
import { requireAuth } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

// Helper function to recalculate totalAmount for BNPL orders that include the fee
function recalculateBNPLTotal(order: any): number {
  const BNPL_FEE_RATE = 0.06; // 6%
  
  // Calculate items total
  const itemsTotal = order.items.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // If items total is 0 or invalid, return original
  if (!itemsTotal || itemsTotal <= 0) {
    return order.totalAmount;
  }

  // Check if stored totalAmount includes the BNPL fee (approximately itemsTotal * 1.06)
  const expectedTotalWithFee = itemsTotal * (1 + BNPL_FEE_RATE);
  const tolerance = 0.10; // Allow small rounding differences
  
  // Check if totalAmount matches the pattern of itemsTotal + 6% fee
  const difference = Math.abs(order.totalAmount - expectedTotalWithFee);
  const isLikelyWithFee = difference < tolerance;
  
  // Check payment method (also handle variations like 'afterpay_clearpay')
  const paymentMethod = (order.paymentMethod || '').toLowerCase();
  const isBNPL = paymentMethod === 'afterpay' || 
                 paymentMethod === 'klarna' || 
                 paymentMethod === 'affirm' ||
                 paymentMethod === 'afterpay_clearpay' ||
                 paymentMethod.includes('afterpay') ||
                 paymentMethod.includes('klarna') ||
                 paymentMethod.includes('affirm');
  
  // If total matches the 6% fee pattern, correct it (regardless of payment method)
  // This ensures order totals never show the BNPL fee, even if paymentMethod wasn't set correctly
  if (isLikelyWithFee) {
    console.log('[orders/route] ✅ Recalculating order total (removing BNPL fee):', {
      orderId: order._id.toString(),
      paymentMethod: order.paymentMethod,
      isBNPL,
      storedTotal: order.totalAmount,
      itemsTotal,
      expectedWithFee: expectedTotalWithFee,
      difference,
      correctedTotal: itemsTotal,
    });
    return itemsTotal;
  }

  // Already correct or doesn't match expected pattern, return as-is
  return order.totalAmount;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    const filter: any = { user: userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.product')
      .lean();

    const correctedOrders = orders.map((order) => {
      const correctedTotal = recalculateBNPLTotal(order);
      const wasCorrected = correctedTotal !== order.totalAmount;
      
      if (wasCorrected) {
        console.log('[orders/route] 📊 Order corrected:', {
          orderId: order._id.toString(),
          originalTotal: order.totalAmount,
          correctedTotal,
        });
      }
      
      return {
        ...order,
        _id: order._id.toString(),
        user: order.user.toString(),
        totalAmount: correctedTotal,
      };
    });

    return NextResponse.json(
      { orders: correctedOrders },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentIntentId,
      itemIds,
      paymentStatus, // Optional: override payment status (for redirect-based payments)
    } = await request.json();

    // Validation
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Shipping address and payment method are required' },
        { status: 400 }
      );
    }

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
      
      if (itemsToProcess.length === 0) {
        return NextResponse.json(
          { error: 'No matching items found in cart' },
          { status: 400 }
        );
      }
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];
    const productIdsToRemove = new Set<string>();

    for (const item of itemsToProcess) {
      const product = item.product as any;
      
      if (!product || !product._id) {
        return NextResponse.json(
          { error: `Product not found for cart item` },
          { status: 404 }
        );
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
      
      console.log('[orders/route] BNPL payment - Order total without fee:', {
        paymentMethod,
        subtotal: totalAmount,
        bnplFee: totalAmount * BNPL_FEE_RATE,
        paymentIntentCharges: totalAmount * (1 + BNPL_FEE_RATE), // What Stripe charges
        orderTotal: finalTotalAmount, // What order shows (without fee)
        note: 'BNPL fee is charged by Stripe but not included in order total',
      });
    } else if (paymentIntentId) {
      // For card payments with payment intent, retrieve and use the actual amount charged
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const paymentIntentAmountInDollars = paymentIntent.amount / 100;
        finalTotalAmount = paymentIntentAmountInDollars;
        
        console.log('[orders/route] Using payment intent amount for card payment:', {
          paymentMethod,
          calculatedTotal: totalAmount,
          paymentIntentAmount: paymentIntentAmountInDollars,
          finalTotalAmount,
          paymentIntentId,
        });
      } catch (error) {
        // If we can't retrieve payment intent, fall back to calculated amount
        console.error('[orders/route] Failed to retrieve payment intent, using calculated amount:', error);
        finalTotalAmount = totalAmount;
      }
    } else {
      // No payment intent ID, use calculated amount
      finalTotalAmount = totalAmount;
    }

    // Create order
    const orderData: any = {
      user: userId,
      items: orderItems,
      totalAmount: finalTotalAmount,
      shippingAddress,
      paymentMethod,
      paymentId: paymentIntentId || '',
      // Use provided paymentStatus if available (for redirect-based payments),
      // otherwise default to 'paid' if paymentIntentId exists, 'pending' otherwise
      paymentStatus: paymentStatus || (paymentIntentId ? 'paid' : 'pending'),
      status: 'pending',
    };

    // Add billing address if provided
    if (billingAddress) {
      orderData.billingAddress = billingAddress;
    }

    const order = await Order.create(orderData) as any;

    // Save used coupon if one was applied
    let couponCode: string | undefined;
    let couponDiscount: number | undefined;
    let couponType: 'percentage' | 'fixed' | undefined;

    // Try to get coupon info from payment intent metadata
    if (paymentIntentId) {
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const metadata = paymentIntent.metadata || {};
        couponCode = metadata.couponCode;
        couponDiscount = metadata.couponDiscount ? parseFloat(metadata.couponDiscount) : undefined;
        couponType = metadata.couponType as 'percentage' | 'fixed' | undefined;
      } catch (error) {
        console.error('Error retrieving payment intent for coupon:', error);
      }
    }

    // Save used coupon if valid
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
        console.log(`[orders/route] Saved used coupon: ${couponCode} for user ${userId}`);
      } catch (error: any) {
        // Log error but don't fail order creation if coupon save fails
        console.error('Error saving used coupon:', error);
        // If it's a duplicate key error, coupon was already used - this shouldn't happen but log it
        if (error.code === 11000) {
          console.warn(`[orders/route] Coupon ${couponCode} was already used by user ${userId}`);
        }
      }
    }

    // Remove only the ordered items from the cart
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      // Remove only selected items - filter out items that were ordered
      const itemsBeforeFilter = cart.items.length;
      cart.items = cart.items.filter((item: any) => {
        // Handle both populated and non-populated product references
        const productId = item.product?._id 
          ? item.product._id.toString() 
          : item.product?.toString() || item.product?.toString();
        const shouldKeep = !productIdsToRemove.has(productId);
        return shouldKeep;
      });
      
      // Log for debugging
      console.log(`Removed ${itemsBeforeFilter - cart.items.length} items from cart. Remaining: ${cart.items.length}`);
    } else {
      // If no itemIds specified, clear entire cart (backward compatibility)
      cart.items = [];
    }
    
    // Save the cart with updated items
    await cart.save();
    
    // Repopulate cart items for the response (if needed)
    await cart.populate('items.product');

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
    console.error('Error creating order:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
