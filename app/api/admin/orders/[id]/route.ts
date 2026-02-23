import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import UsedCoupon from '@/models/UsedCoupon';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
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

    // Attach coupon and verification discount for order summary (same as user order page)
    let couponInfo: { code: string; discount: number; discountType: string; discountAmount?: number } | null = null;
    const usedCoupon = await UsedCoupon.findOne({ orderId: order._id }).lean();
    if (usedCoupon) {
      const subtotal = (order.items || []).reduce(
        (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
      const discountAmount =
        usedCoupon.discountType === 'percentage'
          ? (subtotal * usedCoupon.discount) / 100
          : Math.min(usedCoupon.discount, subtotal);
      couponInfo = {
        code: usedCoupon.couponCode,
        discount: usedCoupon.discount,
        discountType: usedCoupon.discountType,
        discountAmount,
      };
    }
    let verificationDiscountAmount = 0;
    const usedVerificationDiscount = await UsedVerificationDiscount.findOne({ orderId: order._id }).lean();
    if (usedVerificationDiscount && usedVerificationDiscount.discount) {
      verificationDiscountAmount = usedVerificationDiscount.discount;
    }

    const history = (order as any).history || [];
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
        shippingFee: order.shippingFee ?? 0,
        ...(couponInfo && { coupon: couponInfo }),
        ...(verificationDiscountAmount > 0 && { verificationDiscount: verificationDiscountAmount }),
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
        history: history.map((h: any) => ({
          modifiedBy: h.modifiedBy?.toString(),
          modifiedByName: h.modifiedByName,
          changes: h.changes || [],
          note: h.note || '',
          changedAt: h.changedAt?.toISOString?.(),
        })),
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
    const session = await requireAdmin();
    await connectDB();

    const { id: orderId } = await params;
    const body = await request.json();
    const { status, paymentStatus, comment } = body; // UI sends "comment", we save as "note"

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    const changes: { field: string; from: string; to: string }[] = [];

    const existingOrder = await Order.findById(orderId).lean();
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (status && status !== (existingOrder as any).status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status' },
          { status: 400 }
        );
      }
      updateData.status = status;
      changes.push({
        field: 'status',
        from: (existingOrder as any).status || 'pending',
        to: status,
      });
    }

    if (paymentStatus && paymentStatus !== (existingOrder as any).paymentStatus) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status' },
          { status: 400 }
        );
      }
      updateData.paymentStatus = paymentStatus;
      changes.push({
        field: 'paymentStatus',
        from: (existingOrder as any).paymentStatus || 'pending',
        to: paymentStatus,
      });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const commentTrimmed = typeof comment === 'string' ? comment.trim() : '';
    if (!commentTrimmed) {
      return NextResponse.json(
        { error: 'Comment is required when updating order status' },
        { status: 400 }
      );
    }

    const adminUser = session.user as any;
    const modifiedByName = [adminUser.firstName, adminUser.lastName].filter(Boolean).join(' ') || adminUser.name || adminUser.email || 'Admin';

    // Use raw MongoDB update to ensure "note" is persisted (bypass Mongoose schema handling)
    const modifiedBy = mongoose.Types.ObjectId.isValid(adminUser.id)
      ? new mongoose.Types.ObjectId(adminUser.id)
      : adminUser.id;

    const historyEntry = {
      modifiedBy,
      modifiedByName,
      changes,
      note: commentTrimmed,
      changedAt: new Date(),
    };

    const rawUpdate: Record<string, unknown> = { $set: updateData };
    if (changes.length > 0) {
      rawUpdate.$push = { history: historyEntry };
    }

    const updateResult = await Order.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      rawUpdate
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
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

    const history = (order as any).history || [];
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
        history: history.map((h: any) => ({
          modifiedBy: h.modifiedBy?.toString(),
          modifiedByName: h.modifiedByName,
          changes: h.changes || [],
          note: h.note || '',
          changedAt: h.changedAt?.toISOString?.(),
        })),
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

