import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';
import { createCanadaPostShipment, getCanadaPostTracking, getCanadaPostArtifact } from '@/lib/canadaPost';

export const runtime = 'nodejs';

/**
 * POST /api/admin/orders/[id]/create-label
 * Create a Canada Post shipping label for the order. On success, saves tracking number to the order,
 * fetches initial tracking status, sets order status to shipped, and returns the label PDF.
 * Body (optional): { weightKg?: number, length?: number, width?: number, height?: number, serviceCode?: string }
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

    const existing = order as any;
    if (existing.trackingNumber) {
      return NextResponse.json(
        { error: 'Order already has a tracking number. Use refresh-tracking or update order to change it.' },
        { status: 400 }
      );
    }

    const shippingAddress = existing.shippingAddress;
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      return NextResponse.json(
        { error: 'Order shipping address is incomplete' },
        { status: 400 }
      );
    }

    let body: { weightKg?: number; length?: number; width?: number; height?: number; serviceCode?: string } = {};
    try {
      const text = await request.text();
      if (text.trim()) body = JSON.parse(text);
    } catch {
      // optional body
    }

    const weightKg = body.weightKg ?? 1;
    const dimensions =
      body.length != null && body.width != null && body.height != null
        ? { length: body.length, width: body.width, height: body.height }
        : undefined;

    const createResult = await createCanadaPostShipment({
      orderId: String(orderId),
      destination: {
        fullName: shippingAddress.fullName || 'Recipient',
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'CA',
        phone: shippingAddress.phone || '',
      },
      weightKg,
      dimensions,
      serviceCode: body.serviceCode || 'DOM.EP',
    });

    if (createResult.error || !createResult.trackingPin) {
      return NextResponse.json(
        { error: createResult.error || 'Failed to create shipment' },
        { status: 422 }
      );
    }

    const trackingPin = createResult.trackingPin;
    let trackingStatus = 'Label created';
    let trackingEvents: Array<{ date: string; time?: string; description: string; location?: string; province?: string }> = [];

    const trackResult = await getCanadaPostTracking(trackingPin);
    if (!trackResult.error && trackResult.events?.length) {
      trackingStatus = trackResult.latestStatus || trackingStatus;
      trackingEvents = trackResult.events;
    }

    const updateData: Record<string, unknown> = {
      trackingNumber: trackingPin,
      carrier: 'Canada Post',
      trackingStatus,
      trackingUpdatedAt: new Date(),
      trackingEvents,
      status: 'shipped',
    };

    await Order.updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: updateData }
    );

    let labelPdfBase64: string | undefined;
    if (createResult.labelHref) {
      const artifact = await getCanadaPostArtifact(
        createResult.labelHref,
        createResult.labelMediaType || 'application/pdf'
      );
      if (artifact.dataBase64) labelPdfBase64 = artifact.dataBase64;
    }

    return NextResponse.json({
      message: 'Label created',
      trackingNumber: trackingPin,
      shipmentId: createResult.shipmentId,
      labelPdfBase64: labelPdfBase64 || undefined,
    });
  } catch (error: any) {
    console.error('Create label error:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create label' },
      { status: 500 }
    );
  }
}
