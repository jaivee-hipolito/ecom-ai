import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/config/nextauth';
import connectDB from '@/lib/mongodb';
import UsedCoupon from '@/models/UsedCoupon';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { couponCode, orderId, discount, discountType } = await request.json();

    if (!couponCode || !discount || !discountType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await User.findOne({ email: session.user.email }).select('_id');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const code = couponCode.trim().toUpperCase();

    // Double-check if user has already used this coupon (race condition protection)
    const existingUsedCoupon = await UsedCoupon.findOne({
      user: user._id,
      couponCode: code,
    });

    if (existingUsedCoupon) {
      return NextResponse.json(
        { error: 'This coupon has already been used' },
        { status: 400 }
      );
    }

    // Save the used coupon
    const usedCoupon = await UsedCoupon.create({
      user: user._id,
      couponCode: code,
      discount,
      discountType,
      orderId: orderId || undefined,
      usedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      usedCoupon: {
        id: usedCoupon._id,
        couponCode: usedCoupon.couponCode,
        discount: usedCoupon.discount,
        discountType: usedCoupon.discountType,
        usedAt: usedCoupon.usedAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving used coupon:', error);
    
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'This coupon has already been used' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save used coupon' },
      { status: 500 }
    );
  }
}
