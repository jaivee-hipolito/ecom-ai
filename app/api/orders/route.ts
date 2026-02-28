import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import UsedCoupon from '@/models/UsedCoupon';
import { requireAuth } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

import { getSelectedAttributesFromCartItem } from '@/lib/orderItemAttributes';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

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

    const correctedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user.toString(),
      totalAmount: order.totalAmount,
    }));

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

    // Filter items if itemIds is provided (use plain item for getSizeAndColorFromItem so we read all fields)
    let itemsToProcess = cart.items;
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      const itemIdsSet = new Set(itemIds.map((id: string) => id.toString()));
      itemsToProcess = cart.items.filter((item: any) => {
        const productId = item.product && typeof item.product === 'object' ? item.product._id?.toString() : item.product?.toString();
        return productId && itemIdsSet.has(productId);
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

      // No payment intent ID, use calculated amount
    let finalTotalAmount: number;
    if (paymentIntentId) {
      try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        finalTotalAmount = paymentIntent.amount / 100;
      } catch (error) {
        console.error('[orders/route] Failed to retrieve payment intent, using calculated amount:', error);
        finalTotalAmount = totalAmount;
      }
    } else {
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
