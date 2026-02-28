import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

/**
 * GET /api/products/[id]/availability
 * Stock is deducted when orders are paid and restored when cancelled/refunded.
 * inPaidOrdersNotDelivered = quantity in paid orders that are not yet delivered (for admin note).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const productId = id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const totalStock = product.stock ?? 0;

    // Quantity in paid orders that are not yet delivered (exclude delivered + cancelled)
    const paidNotDeliveredOrders = await Order.find({
      'items.product': productId,
      paymentStatus: 'paid',
      status: { $nin: ['delivered', 'cancelled'] },
    })
      .select('items')
      .lean();

    let inPaidOrdersNotDelivered = 0;
    const productIdStr = productId.toString();
    paidNotDeliveredOrders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const id = item.product?.toString?.() ?? item.product;
        if (id && id === productIdStr) {
          inPaidOrdersNotDelivered += item.quantity || 0;
        }
      });
    });

    return NextResponse.json({
      productId,
      totalStock,
      orderedQuantity: 0,
      availableStock: totalStock,
      isOutOfStock: totalStock === 0,
      inPaidOrdersNotDelivered,
    });
  } catch (error: any) {
    console.error('Error fetching product availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product availability' },
      { status: 500 }
    );
  }
}
