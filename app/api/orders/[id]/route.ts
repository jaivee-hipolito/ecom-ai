import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId)
      .populate('items.product')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Ensure the order belongs to the authenticated user
    if (order.user.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        ...order,
        _id: order._id.toString(),
        user: order.user.toString(),
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
        items: order.items.map((item: any) => ({
          ...item,
          product: item.product
            ? typeof item.product === 'object'
              ? {
                  _id: item.product._id.toString(),
                  name: item.product.name,
                  image: item.product.coverImage || item.product.images?.[0],
                }
              : item.product.toString()
            : item.product,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
