import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import { requireAuth } from '@/lib/auth';
import { ShippingAddress } from '@/types/address';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// PUT - Update an address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();
    const { id } = await params;

    const userId = (session.user as any).id;
    const addressData: Partial<ShippingAddress> & { isDefault?: boolean } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    const address = await Address.findOne({ _id: id, user: userId });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset other default addresses
    if (addressData.isDefault === true) {
      await Address.updateMany(
        { user: userId, _id: { $ne: id } },
        { isDefault: false }
      );
    }

    // Update address fields
    Object.assign(address, addressData);
    await address.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      address: {
        ...address.toObject(),
        _id: address._id.toString(),
        user: address.user.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating address:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();
    const { id } = await params;

    const userId = (session.user as any).id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    const address = await Address.findOneAndDelete({ _id: id, user: userId });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}
