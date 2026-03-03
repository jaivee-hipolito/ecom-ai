import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/admin/users/[id]/lock
 * Admin-only: lock a user account (set isLocked true). Prevents locking your own account.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any)?.id;
    if (currentUserId && String(currentUserId) === String(userId)) {
      return NextResponse.json(
        { error: 'You cannot lock your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isLocked: true, failedLoginAttempts: 3 } },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Account locked successfully',
      user: {
        _id: user._id.toString(),
        email: user.email,
        isLocked: user.isLocked,
        failedLoginAttempts: user.failedLoginAttempts,
      },
    });
  } catch (error: any) {
    console.error('Lock user error:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to lock account' },
      { status: 500 }
    );
  }
}
