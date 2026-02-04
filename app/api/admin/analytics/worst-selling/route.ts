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
    const maxQuantity = parseInt(searchParams.get('maxQuantity') || '10');

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

    // Get all products
    const allProducts = await Product.find().lean();

    // Get product sales from orders
    const productSalesMap = new Map();
    const salesData = await Order.aggregate([
      { $match: orderFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    salesData.forEach((item) => {
      productSalesMap.set(item._id.toString(), {
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
        orderCount: item.orderCount,
      });
    });

    // Fetch all categories for mapping
    const categories = await Category.find().lean();
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), cat.name);
    });

    // Map products with sales data (0 for products with no sales)
    const productsWithSales = allProducts.map((product) => {
      const productId = product._id.toString();
      const sales = productSalesMap.get(productId) || {
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0,
      };
      const categoryId = product.category?.toString();
      const categoryName = categoryMap.get(categoryId || '') || product.category || 'N/A';

      return {
        productId,
        productName: product.name,
        category: categoryName,
        totalQuantity: sales.totalQuantity,
        totalRevenue: sales.totalRevenue,
        orderCount: sales.orderCount,
        currentPrice: product.price || 0,
        stock: product.stock || 0,
        image: product.coverImage || product.images?.[0] || '',
      };
    });

    // Filter and sort by quantity (ascending - worst first)
    const worstSelling = productsWithSales
      .filter((p) => p.totalQuantity <= maxQuantity)
      .sort((a, b) => {
        // First sort by quantity (ascending)
        if (a.totalQuantity !== b.totalQuantity) {
          return a.totalQuantity - b.totalQuantity;
        }
        // Then by order count (ascending)
        return a.orderCount - b.orderCount;
      })
      .slice(0, limit);

    return NextResponse.json({
      products: worstSelling,
      total: worstSelling.length,
    });
  } catch (error: any) {
    console.error('Error fetching worst selling products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch worst selling products' },
      { status: 500 }
    );
  }
}

