import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/admin/users/[id]/unlock
 * Admin-only: unlock a user account (reset isLocked and failedLoginAttempts).
 * Uses session/JWT auth and requireAdmin middleware.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isLocked: false, failedLoginAttempts: 0 } },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account unlocked successfully',
      user: {
        _id: user._id.toString(),
        email: user.email,
        isLocked: user.isLocked,
        failedLoginAttempts: user.failedLoginAttempts,
      },
    });
  } catch (error: any) {
    console.error('Unlock user error:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to unlock account' },
      { status: 500 }
    );
  }
}
