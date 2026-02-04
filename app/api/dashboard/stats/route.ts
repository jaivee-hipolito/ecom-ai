import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Wishlist from '@/models/Wishlist';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;

    // Fetch orders for the user
    const orders = await Order.find({ user: userId }).lean();

    // Calculate statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order) => order.status === 'delivered'
    ).length;
    const pendingOrders = orders.filter(
      (order) => order.status === 'pending' || order.status === 'processing'
    ).length;
    const processingOrders = orders.filter(
      (order) => order.status === 'processing'
    ).length;
    const shippedOrders = orders.filter(
      (order) => order.status === 'shipped'
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === 'cancelled'
    ).length;

    // Calculate total spent (all paid orders, excluding cancelled orders)
    // This represents money actually spent, regardless of delivery status
    const totalSpent = orders
      .filter(
        (order) =>
          order.paymentStatus === 'paid' && order.status !== 'cancelled'
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate total pending amount (orders that are pending/processing/shipped)
    const pendingAmount = orders
      .filter(
        (order) =>
          (order.status === 'pending' ||
            order.status === 'processing' ||
            order.status === 'shipped') &&
          order.paymentStatus === 'paid'
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Get cart items count
    const cart = await Cart.findOne({ user: userId });
    const cartItemsCount = cart?.items?.length || 0;

    // Get wishlist items count
    const wishlist = await Wishlist.findOne({ user: userId });
    const wishlistItemsCount = wishlist?.products?.length || 0;

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id totalAmount status paymentStatus createdAt items')
      .lean();

    // Calculate average order value
    const averageOrderValue =
      totalOrders > 0
        ? orders.reduce((sum, order) => sum + order.totalAmount, 0) /
          totalOrders
        : 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        cancelledOrders,
        totalSpent,
        pendingAmount,
        cartItemsCount,
        wishlistItemsCount,
        averageOrderValue,
      },
      recentOrders: recentOrders.map((order) => ({
        _id: order._id.toString(),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt?.toISOString(),
        itemsCount: order.items.length,
        firstItem: order.items[0]?.name || 'N/A',
      })),
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

