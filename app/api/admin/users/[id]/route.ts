import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function DELETE(
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

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has any orders (optional - you might want to prevent deletion if orders exist)
    const orderCount = await Order.countDocuments({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        _id: user._id.toString(),
        email: user.email,
        orderCount,
      },
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
