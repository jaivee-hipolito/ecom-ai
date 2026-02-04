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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Count all orders (including pending) for analytics, but prioritize paid orders
    // This gives a more complete picture of sales activity
    const orderFilter = {
      ...dateFilter,
      // Include all order statuses except cancelled for revenue calculation
      status: { $nin: ['cancelled'] },
    };
    
    // For revenue calculation, only count paid orders
    const revenueOrderFilter = {
      ...dateFilter,
      status: { $nin: ['cancelled'] },
      paymentStatus: 'paid',
    };

    // Total orders count (all non-cancelled orders)
    const ordersCountResult = await Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Total revenue (only from paid orders)
    const revenueResult = await Order.aggregate([
      { $match: revenueOrderFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalOrders = ordersCountResult[0]?.totalOrders || 0;

    // Revenue by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDate = await Order.aggregate([
      {
        $match: {
          ...revenueOrderFilter,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products (from paid orders)
    const topProducts = await Order.aggregate([
      { $match: revenueOrderFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          productName: { $first: '$items.name' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Populate product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await Product.findById(item._id).lean();
        return {
          productId: item._id.toString(),
          productName: item.productName,
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue,
          image: product?.coverImage || product?.images?.[0] || '',
        };
      })
    );

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Total products count
    const totalProducts = await Product.countDocuments({});

    // Product category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Fetch category names
    const categories = await Category.find().lean();
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), cat.name);
      categoryMap.set(cat.name, cat.name);
    });

    const categoryDistributionWithNames = categoryDistribution.map((item) => {
      const categoryId = item._id?.toString();
      const categoryName = categoryMap.get(categoryId || '') || item._id || 'Unknown';
      return {
        category: categoryName,
        count: item.count,
      };
    });

    // Stock level summary
    const stockSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          inStock: {
            $sum: {
              $cond: [{ $gt: ['$stock', 0] }, 1, 0],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0],
            },
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stockData = stockSummary[0] || {
      totalStock: 0,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
    };

    // Views/popularity metrics
    const viewsMetrics = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $ifNull: ['$views', 0] } },
          averageViews: { $avg: { $ifNull: ['$views', 0] } },
          maxViews: { $max: { $ifNull: ['$views', 0] } },
          productsWithViews: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ['$views', 0] }, 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    const viewsData = viewsMetrics[0] || {
      totalViews: 0,
      averageViews: 0,
      maxViews: 0,
      productsWithViews: 0,
    };

    // Sales by category
    let salesByCategoryWithNames: Array<{
      category: string;
      totalRevenue: number;
      totalQuantity: number;
    }> = [];

    try {
      const salesByCategory = await Order.aggregate([
        { $match: revenueOrderFilter },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$productInfo.category',
            totalRevenue: {
              $sum: { $multiply: ['$items.quantity', '$items.price'] },
            },
            totalQuantity: { $sum: '$items.quantity' },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      salesByCategoryWithNames = salesByCategory.map((item) => {
        const categoryId = item._id?.toString();
        const categoryName = categoryMap.get(categoryId || '') || item._id || 'Unknown';
        return {
          category: categoryName,
          totalRevenue: item.totalRevenue || 0,
          totalQuantity: item.totalQuantity || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      // Return empty array if there's an error
      salesByCategoryWithNames = [];
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      averageOrderValue,
      revenueByDate,
      topProducts: topProductsWithDetails,
      categoryDistribution: categoryDistributionWithNames,
      stockSummary: stockData,
      viewsMetrics: viewsData,
      salesByCategory: salesByCategoryWithNames,
    });
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sales analytics' },
      { status: 500 }
    );
  }
}

