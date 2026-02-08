import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/config/nextauth';
import connectDB from '@/lib/mongodb';
import UsedCoupon from '@/models/UsedCoupon';
import User from '@/models/User';

// Available coupon codes - In production, this should come from a database
const COUPON_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE10': { discount: 10, type: 'fixed' },
  'FLASH10': { discount: 10, type: 'fixed' },
  'NEWUSER10': { discount: 10, type: 'fixed' },
  'SAVE50': { discount: 50, type: 'fixed' },
  'WELCOME10': { discount: 10, type: 'fixed' },
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to use coupons.' },
        { status: 401 }
      );
    }

    const { couponCode } = await request.json();

    if (!couponCode || typeof couponCode !== 'string') {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const code = couponCode.trim().toUpperCase();

    // Check if coupon code exists
    const coupon = COUPON_CODES[code];
    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
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

    // Check if user has already used this coupon
    const usedCoupon = await UsedCoupon.findOne({
      user: user._id,
      couponCode: code,
    });

    if (usedCoupon) {
      return NextResponse.json(
        { 
          error: 'This coupon has already been used. Each coupon can only be used once per customer.',
          alreadyUsed: true 
        },
        { status: 400 }
      );
    }

    // Return valid coupon details
    return NextResponse.json({
      valid: true,
      coupon: {
        code,
        discount: coupon.discount,
        type: coupon.type,
      },
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon. Please try again.' },
      { status: 500 }
    );
  }
}
