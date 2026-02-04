import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/models/Address';
import { requireAuth } from '@/lib/auth';
import { ShippingAddress } from '@/types/address';

export const runtime = 'nodejs';

// GET - Fetch all addresses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;

    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({
      addresses: addresses.map((addr) => ({
        ...addr.toObject(),
        _id: addr._id.toString(),
        user: addr.user.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const addressData: ShippingAddress & { isDefault?: boolean } = await request.json();

    const { fullName, address, city, state, zipCode, country, phone, isDefault } = addressData;

    // Validate required fields
    if (!fullName || !address || !city || !state || !zipCode || !country || !phone) {
      return NextResponse.json(
        { error: 'All address fields are required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      fullName,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: isDefault || false,
    });

    return NextResponse.json(
      {
        message: 'Address created successfully',
        address: {
          ...newAddress.toObject(),
          _id: newAddress._id.toString(),
          user: newAddress.user.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating address:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create address' },
      { status: 500 }
    );
  }
}
