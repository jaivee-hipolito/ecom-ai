import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import UsedCoupon from '@/models/UsedCoupon';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
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

    // Fetch coupon used for this order
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

    // Fetch verification discount used for this order ($5 off for verified phone & email)
    let verificationDiscountAmount = 0;
    const usedVerificationDiscount = await UsedVerificationDiscount.findOne({ orderId: order._id }).lean();
    if (usedVerificationDiscount && usedVerificationDiscount.discount) {
      verificationDiscountAmount = usedVerificationDiscount.discount;
    }

    return NextResponse.json(
      {
        order: {
          ...order,
          _id: order._id.toString(),
          shippingFee: order.shippingFee ?? 0,
          ...(couponInfo && { coupon: couponInfo }),
          ...(verificationDiscountAmount > 0 && { verificationDiscount: verificationDiscountAmount }),
          user: order.user.toString(),
          totalAmount: order.totalAmount,
          createdAt: order.createdAt?.toISOString(),
          updatedAt: order.updatedAt?.toISOString(),
          items: order.items.map((item: any) => ({
            ...item,
            selectedAttributes: item.selectedAttributes ?? undefined,
            image: item.image || (item.product && typeof item.product === 'object'
              ? (item.product.coverImage || item.product.images?.[0] || '')
              : ''),
            product: item.product
              ? typeof item.product === 'object'
                ? {
                    _id: item.product._id.toString(),
                    name: item.product.name,
                    coverImage: item.product.coverImage || item.product.images?.[0] || '',
                    images: item.product.images || [],
                    attributes: item.product.attributes || undefined,
                  }
                : item.product.toString()
              : item.product,
          })),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
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
