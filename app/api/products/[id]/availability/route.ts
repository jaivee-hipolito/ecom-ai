import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

/**
 * GET /api/products/[id]/availability
 * Get product availability considering paid orders
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

    // Get product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate total quantity in paid orders for this product
    // Only count orders with paymentStatus = 'paid' and status != 'cancelled'
    const paidOrders = await Order.find({
      'items.product': productId,
      paymentStatus: 'paid',
      status: { $ne: 'cancelled' },
    });

    let totalOrderedQuantity = 0;
    paidOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        const itemProductId = typeof item.product === 'object' 
          ? item.product._id?.toString() 
          : item.product?.toString();
        // Compare product IDs (handle both ObjectId and string)
        const productIdStr = productId.toString();
        if (itemProductId && itemProductId === productIdStr) {
          totalOrderedQuantity += item.quantity || 0;
        }
      });
    });

    console.log(`Product ${productId}: Total stock=${product.stock}, Ordered=${totalOrderedQuantity}, Available=${Math.max(0, product.stock - totalOrderedQuantity)}`);

    // Calculate available stock
    const totalStock = product.stock || 0;
    const availableStock = Math.max(0, totalStock - totalOrderedQuantity);

    return NextResponse.json({
      productId,
      totalStock,
      orderedQuantity: totalOrderedQuantity,
      availableStock,
      isOutOfStock: availableStock === 0,
    });
  } catch (error: any) {
    console.error('Error fetching product availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product availability' },
      { status: 500 }
    );
  }
}
