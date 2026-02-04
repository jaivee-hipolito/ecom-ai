import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minQuantity = parseInt(searchParams.get('minQuantity') || '0');

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Only count completed/paid orders
    const orderFilter = {
      ...dateFilter,
      status: { $in: ['processing', 'shipped', 'delivered'] },
      paymentStatus: 'paid',
    };

    // Aggregate product sales
    const productSales = await Order.aggregate([
      { $match: orderFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 },
          productName: { $first: '$items.name' },
        },
      },
      {
        $match: {
          totalQuantity: { $gte: minQuantity },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    // Fetch all categories for mapping
    const categories = await Category.find().lean();
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), cat.name);
    });

    // Populate product details
    const productsWithDetails = await Promise.all(
      productSales.map(async (item) => {
        const product = await Product.findById(item._id).lean();
        const categoryId = product?.category?.toString();
        const categoryName = categoryMap.get(categoryId || '') || product?.category || 'N/A';

        return {
          productId: item._id.toString(),
          productName: item.productName,
          category: categoryName,
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue,
          orderCount: item.orderCount,
          currentPrice: product?.price || 0,
          stock: product?.stock || 0,
          image: product?.coverImage || product?.images?.[0] || '',
        };
      })
    );

    return NextResponse.json({
      products: productsWithDetails,
      total: productsWithDetails.length,
    });
  } catch (error: any) {
    console.error('Error fetching best selling products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch best selling products' },
      { status: 500 }
    );
  }
}

