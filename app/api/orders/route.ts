import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

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

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        _id: order._id.toString(),
        user: order.user.toString(),
      })),
    });
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
      paymentMethod,
      paymentIntentId,
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

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      
      if (!product || !product._id) {
        return NextResponse.json(
          { error: `Product not found for cart item` },
          { status: 404 }
        );
      }

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

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentId: paymentIntentId || '',
      paymentStatus: paymentIntentId ? 'paid' : 'pending',
      status: 'pending',
    });

    // Clear the cart after order creation
    cart.items = [];
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
