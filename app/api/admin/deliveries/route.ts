import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import UsedCoupon from '@/models/UsedCoupon';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    
    // Ensure User model is registered before populating
    // This prevents "Schema hasn't been registered" errors
    // The User import above should register it, but verify it's available
    // Access the model to ensure it's evaluated
    if (!mongoose.models.User) {
      // Force registration by ensuring User model is loaded
      // This happens when the module is imported, but we verify
      const UserModule = await import('@/models/User');
      if (UserModule.default && !mongoose.models.User) {
        // If still not registered, there's a deeper issue
        console.warn('User model not registered after import');
      }
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;

    // Build filter query - only get orders that need delivery
    const filter: any = {
      status: { $in: ['pending', 'processing', 'shipped'] }, // Only orders that haven't been delivered
    };

    if (status) {
      filter.status = status;
    }

    // Fetch orders with user population, sorted by customer
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email contactNumber')
      .sort({ 'shippingAddress.city': 1, 'shippingAddress.address': 1, createdAt: -1 })
      .lean();

    // Group orders by customer (user)
    // Ensure each customer appears only once, regardless of number of orders
    const deliveriesByCustomer: Record<string, any[]> = {};

    orders.forEach((order) => {
      // Handle deleted users - group by email or name to avoid duplicates
      if (!order.user) {
        // Use email from shipping address or name as identifier for deleted users
        // This ensures same deleted customer appears only once
        const email = order.shippingAddress?.phone || '';
        const name = order.shippingAddress?.fullName || 'unknown';
        const fallbackId = `deleted_${name.toLowerCase().replace(/\s+/g, '_')}_${email}`;
        
        if (!deliveriesByCustomer[fallbackId]) {
          deliveriesByCustomer[fallbackId] = [];
        }

        deliveriesByCustomer[fallbackId].push({
          ...order,
          _id: order._id.toString(),
          user: null,
          createdAt: order.createdAt?.toISOString(),
          updatedAt: order.updatedAt?.toISOString(),
        });
        return;
      }

      // For active users, group by userId (ensures one entry per customer)
      const userId = typeof order.user === 'object' && order.user !== null && '_id' in order.user
        ? (order.user as any)._id.toString()
        : String(order.user);

      // Initialize array if customer doesn't exist
      if (!deliveriesByCustomer[userId]) {
        deliveriesByCustomer[userId] = [];
      }

      // Add order to customer's delivery list
      deliveriesByCustomer[userId].push({
        ...order,
        _id: order._id.toString(),
        user: typeof order.user === 'object' && order.user !== null && '_id' in order.user
          ? {
              _id: (order.user as any)._id.toString(),
              firstName: (order.user as any).firstName,
              lastName: (order.user as any).lastName,
              contactNumber: (order.user as any).contactNumber,
              email: (order.user as any).email,
            }
          : String(order.user || ''),
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
      });
    });

    // Convert to array format with customer info
    // Each entry represents ONE customer with all their orders grouped together
    const deliveries = Object.entries(deliveriesByCustomer).map(([userId, orders]) => {
      const firstOrder = orders[0];
      const customer = typeof firstOrder.user === 'object' && firstOrder.user !== null
        ? firstOrder.user
        : null;

      // Count pending/processing orders (not shipped)
      const pendingOrders = orders.filter(
        (order) => order.status === 'pending' || order.status === 'processing'
      );
      const shippedOrders = orders.filter((order) => order.status === 'shipped');

      // Handle deleted users
      const isDeletedUser = userId.startsWith('deleted_');
      const customerName = customer?.firstName && customer?.lastName
        ? `${customer.firstName} ${customer.lastName}`
        : firstOrder.shippingAddress?.fullName || 'Unknown Customer';
      const customerEmail = customer?.email || firstOrder.shippingAddress?.phone || 'N/A';

      // Use a stable customerId - userId for active users, stable ID for deleted
      const customerId = isDeletedUser ? userId : userId;

      return {
        customerId,
        customerName: isDeletedUser ? `${customerName} (Deleted User)` : customerName,
        customerEmail,
        shippingAddress: firstOrder.shippingAddress,
        orders: orders, // All orders for this customer grouped together
        totalOrders: orders.length, // Total number of orders for this customer
        pendingOrders: pendingOrders.length,
        shippedOrders: shippedOrders.length,
        totalAmount: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        isDeletedUser,
      };
    });

    // Sort deliveries by customer name (ensures consistent ordering)
    deliveries.sort((a, b) => a.customerName.localeCompare(b.customerName));

    // Enrich each order with coupon and verification discount for PDF breakdown
    const allOrderIds = orders.map((o) => o._id);
    const [usedCoupons, usedVerificationDiscounts] = await Promise.all([
      UsedCoupon.find({ orderId: { $in: allOrderIds } }).lean(),
      UsedVerificationDiscount.find({ orderId: { $in: allOrderIds } }).lean(),
    ]);
    const couponByOrderId: Record<string, { code: string; discount: number; discountType: string; discountAmount: number }> = {};
    usedCoupons.forEach((uc: any) => {
      if (uc.orderId) {
        const oid = uc.orderId.toString();
        const order = orders.find((o) => o._id.toString() === oid);
        const subtotal = order?.items?.reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 0), 0) ?? 0;
        const discountAmount =
          uc.discountType === 'percentage' ? (subtotal * uc.discount) / 100 : Math.min(uc.discount, subtotal);
        couponByOrderId[oid] = {
          code: uc.couponCode,
          discount: uc.discount,
          discountType: uc.discountType,
          discountAmount,
        };
      }
    });
    const verificationDiscountByOrderId: Record<string, number> = {};
    usedVerificationDiscounts.forEach((uv: any) => {
      if (uv.orderId) verificationDiscountByOrderId[uv.orderId.toString()] = uv.discount || 0;
    });

    // Attach to each order in deliveries
    deliveries.forEach((d) => {
      d.orders = d.orders.map((ord: any) => {
        const oid = ord._id?.toString?.() || ord._id;
        const coupon = couponByOrderId[oid];
        const verificationDiscount = verificationDiscountByOrderId[oid] ?? 0;
        return {
          ...ord,
          ...(coupon && { coupon }),
          ...(verificationDiscount > 0 && { verificationDiscount }),
        };
      });
    });

    return NextResponse.json({
      deliveries,
      total: deliveries.length,
      totalOrders: orders.length,
    });
  } catch (error: any) {
    console.error('Error fetching deliveries:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}
