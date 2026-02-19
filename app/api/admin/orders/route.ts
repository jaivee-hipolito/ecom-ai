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
    const searchOrderId = searchParams.get('searchOrderId') || undefined;
    const searchCustomer = searchParams.get('searchCustomer') || undefined;
    const searchAmount = searchParams.get('searchAmount') || undefined;
    const searchItemName = searchParams.get('searchItemName') || undefined;
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const order = sortOrder === 'asc' ? 1 : -1;

    // Build filter query
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Order ID search (partial match on _id string)
    if (searchOrderId && searchOrderId.trim()) {
      const orderIdStr = searchOrderId.trim();
      try {
        if (/^[a-fA-F0-9]{24}$/.test(orderIdStr)) {
          filter._id = new mongoose.Types.ObjectId(orderIdStr);
        } else {
          filter.$expr = { $regexMatch: { input: { $toString: '$_id' }, regex: escapeRegex(orderIdStr), options: 'i' } };
        }
      } catch {
        filter.$expr = { $regexMatch: { input: { $toString: '$_id' }, regex: escapeRegex(orderIdStr), options: 'i' } };
      }
    }

    // Customer name search (shipping name or user name/email)
    if (searchCustomer && searchCustomer.trim()) {
      const customerRegex = { $regex: escapeRegex(searchCustomer.trim()), $options: 'i' };
      const matchingUsers = await User.find({
        $or: [
          { firstName: customerRegex },
          { lastName: customerRegex },
          { email: customerRegex },
        ],
      }).select('_id').lean();
      const userIds = matchingUsers.map((u) => u._id);
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { 'shippingAddress.fullName': customerRegex },
          ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
        ],
      });
    }

    // Amount search (exact or numeric match)
    if (searchAmount && searchAmount.trim()) {
      const amountNum = parseFloat(searchAmount.trim().replace(/[^0-9.-]/g, ''));
      if (!isNaN(amountNum)) {
        filter.$and = filter.$and || [];
        filter.$and.push({ totalAmount: amountNum });
      }
    }

    // Item name search
    if (searchItemName && searchItemName.trim()) {
      filter['items.name'] = { $regex: escapeRegex(searchItemName.trim()), $options: 'i' };
    }

    // Build sort object
    const sortFieldMap: Record<string, string> = {
      updatedAt: 'updatedAt',
      createdAt: 'createdAt',
      customer: 'shippingAddress.fullName',
      status: 'status',
      paymentStatus: 'paymentStatus',
      amount: 'totalAmount',
    };
    const sortField = sortFieldMap[sortBy] || 'updatedAt';

    // For "items" we need aggregation to sort by array size
    if (sortBy === 'items') {
      const skip = (page - 1) * limit;
      const total = await Order.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const orders = await Order.aggregate([
        { $match: filter },
        { $addFields: { itemsCount: { $size: { $ifNull: ['$items', []] } } } },
        { $sort: { itemsCount: order } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDoc',
          },
        },
        { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            user: {
              _id: '$userDoc._id',
              firstName: '$userDoc.firstName',
              lastName: '$userDoc.lastName',
              email: '$userDoc.email',
              contactNumber: '$userDoc.contactNumber',
            },
          },
        },
        { $project: { userDoc: 0 } },
      ]);

      return NextResponse.json({
        orders: orders.map((order) => {
          const user = order.user && order.user._id
            ? {
                _id: order.user._id.toString(),
                firstName: order.user.firstName || '',
                lastName: order.user.lastName || '',
                name: `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Unknown',
                email: order.user.email || 'N/A',
                contactNumber: order.user.contactNumber || 'N/A',
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
            createdAt: order.createdAt?.toISOString?.(),
            updatedAt: order.updatedAt?.toISOString?.(),
          };
        }),
        total,
        page,
        limit,
        totalPages,
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const sortObj: any = {};
    sortObj[sortField] = order;

    // Fetch orders with user population
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email contactNumber')
      .sort(sortObj)
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

