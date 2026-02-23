import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UsedVerificationDiscount from '@/models/UsedVerificationDiscount';
import { requireAuth } from '@/lib/auth';

const VERIFICATION_DISCOUNT_AMOUNT = 5;

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;

    // Check if user already used verification discount (one-time only)
    const usedDiscount = await UsedVerificationDiscount.findOne({ user: userId });
    if (usedDiscount) {
      return NextResponse.json({
        eligible: false,
        discount: 0,
        source: null,
        canBecomeEligible: false,
        message: 'You have already used your one-time verification discount.',
      });
    }

    const user = await User.findById(userId)
      .select('emailVerified phoneVerified')
      .lean();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const emailVerified = !!(user as any).emailVerified;
    const phoneVerified = !!(user as any).phoneVerified;

    // User is eligible only when BOTH phone AND email are verified
    if (phoneVerified && emailVerified) {
      return NextResponse.json({
        eligible: true,
        discount: VERIFICATION_DISCOUNT_AMOUNT,
        source: 'both',
        canBecomeEligible: false,
        message: 'Get $5 off for verifying both your phone number and email.',
      });
    }

    // Not both verified yet - can become eligible
    return NextResponse.json({
      eligible: false,
      discount: 0,
      source: null,
      canBecomeEligible: true,
      message:
        'Verify both your phone number and email address to get $5 off your first order! One-time discount only.',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Verification discount eligibility error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
