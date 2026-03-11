import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';
import { getCanadaPostTracking } from '@/lib/canadaPost';

export const runtime = 'nodejs';

/**
 * POST /api/admin/orders/[id]/refresh-tracking
 * Re-fetches tracking from Canada Post and updates the order.
 * Use after adding a tracking number or to sync latest status.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const pin = (order as any).trackingNumber;
    const carrier = ((order as any).carrier || '').toLowerCase();
    if (!pin || !carrier.includes('canada post')) {
      return NextResponse.json(
        { error: 'Order has no Canada Post tracking number to refresh' },
        { status: 400 }
      );
    }

    const result = await getCanadaPostTracking(pin);
    if (result.error) {
      return NextResponse.json(
        { error: result.error, orderId },
        { status: 422 }
      );
    }

    const update: Record<string, unknown> = {
      trackingStatus: result.latestStatus || 'Tracking available',
      trackingUpdatedAt: new Date(),
      trackingEvents: result.events || [],
    };
    if (result.delivered) {
      update.status = 'delivered';
    }

    await Order.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: update }
    );

    return NextResponse.json({
      message: 'Tracking refreshed',
      trackingStatus: update.trackingStatus,
      delivered: result.delivered,
      eventsCount: (result.events || []).length,
    });
  } catch (error: any) {
    console.error('Refresh tracking error:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to refresh tracking' },
      { status: 500 }
    );
  }
}
