import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    
    // Ensure User model is registered before populating
    if (!mongoose.models.User) {
      await import('@/models/User');
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;

    // Build filter query
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    
    // If search is provided, find matching users first, then include their order IDs
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions: any[] = [
        { _id: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.address': searchRegex },
        { 'shippingAddress.city': searchRegex },
      ];

      // Search for users matching the search term
      const matchingUsers = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      }).select('_id').lean();

      if (matchingUsers.length > 0) {
        const userIds = matchingUsers.map((u) => u._id);
        searchConditions.push({ user: { $in: userIds } });
      }

      filter.$or = searchConditions;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch orders with user population
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email contactNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      orders: orders.map((order) => {
        // Handle deleted users (null user)
        const user = typeof order.user === 'object' && order.user !== null && '_id' in order.user
          ? {
              _id: (order.user as any)._id.toString(),
              firstName: (order.user as any).firstName || '',
              lastName: (order.user as any).lastName || '',
              name: `${(order.user as any).firstName || ''} ${(order.user as any).lastName || ''}`.trim() || 'Unknown',
              email: (order.user as any).email || 'N/A',
              contactNumber: (order.user as any).contactNumber || 'N/A',
            }
          : {
              _id: null,
              firstName: '',
              lastName: '',
              name: order.shippingAddress?.fullName || 'Deleted User',
              email: order.shippingAddress?.phone || 'N/A',
              contactNumber: 'N/A',
            };

        return {
          ...order,
          _id: order._id.toString(),
          user,
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
        };
      }),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

