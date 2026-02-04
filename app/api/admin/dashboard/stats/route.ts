import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    // Fetch all data in parallel for better performance
    const [products, orders, users] = await Promise.all([
      Product.find({}).lean(),
      Order.find({}).lean(),
      User.find({}).select('-password').lean(),
    ]);

    // Calculate product statistics
    const totalProducts = products.length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock < 10
    ).length;
    const inStockProducts = products.filter((p) => p.stock > 0).length;
    const featuredProducts = products.filter((p) => p.featured).length;

    // Calculate order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === 'pending'
    ).length;
    const processingOrders = orders.filter(
      (order) => order.status === 'processing'
    ).length;
    const shippedOrders = orders.filter(
      (order) => order.status === 'shipped'
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status === 'delivered'
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === 'cancelled'
    ).length;

    // Calculate revenue statistics
    // Total revenue from all paid orders (excluding cancelled)
    const totalRevenue = orders
      .filter(
        (order) =>
          order.paymentStatus === 'paid' && order.status !== 'cancelled'
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Revenue from delivered orders only
    const deliveredRevenue = orders
      .filter(
        (order) =>
          order.status === 'delivered' && order.paymentStatus === 'paid'
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Pending revenue (orders that are paid but not yet delivered)
    const pendingRevenue = orders
      .filter(
        (order) =>
          order.paymentStatus === 'paid' &&
          order.status !== 'delivered' &&
          order.status !== 'cancelled'
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate user statistics
    const totalUsers = users.length;
    const adminUsers = users.filter((u) => u.role === 'admin').length;
    const customerUsers = users.filter((u) => u.role === 'customer').length;

    // Calculate average order value
    const averageOrderValue =
      totalOrders > 0
        ? orders.reduce((sum, order) => sum + order.totalAmount, 0) /
          totalOrders
        : 0;

    // Calculate total items sold
    const totalItemsSold = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Get recent orders (last 5)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('_id totalAmount status paymentStatus createdAt items user')
      .lean();

    // Get low stock products (for alerts)
    const lowStockProductsList = products
      .filter((p) => p.stock > 0 && p.stock < 10)
      .slice(0, 5)
      .map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        stock: p.stock,
      }));

    return NextResponse.json({
      stats: {
        // Products
        totalProducts,
        outOfStockProducts,
        lowStockProducts,
        inStockProducts,
        featuredProducts,
        // Orders
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        // Revenue
        totalRevenue,
        deliveredRevenue,
        pendingRevenue,
        // Users
        totalUsers,
        adminUsers,
        customerUsers,
        // Additional metrics
        averageOrderValue,
        totalItemsSold,
      },
      recentOrders: recentOrders.map((order) => ({
        _id: order._id.toString(),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt?.toISOString(),
        itemsCount: order.items.length,
        customerName: (order.user as any)?.name || 'N/A',
        customerEmail: (order.user as any)?.email || 'N/A',
      })),
      lowStockProducts: lowStockProductsList,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

