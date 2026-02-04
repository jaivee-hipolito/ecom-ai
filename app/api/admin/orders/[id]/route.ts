import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: {
        ...order,
        _id: order._id.toString(),
        user: typeof order.user === 'object' && order.user !== null
          ? {
              _id: (order.user as any)._id.toString(),
              name: (order.user as any).name,
              email: (order.user as any).email,
            }
          : String(order.user || ''),
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
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id: orderId } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status' },
          { status: 400 }
        );
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('items.product')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order: {
        ...order,
        _id: order._id.toString(),
        user: typeof order.user === 'object' && order.user !== null
          ? {
              _id: (order.user as any)._id.toString(),
              name: (order.user as any).name,
              email: (order.user as any).email,
            }
          : String(order.user || ''),
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
    console.error('Error updating order:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}

