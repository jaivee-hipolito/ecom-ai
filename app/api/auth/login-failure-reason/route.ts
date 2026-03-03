import { NextRequest, NextResponse } from 'next/server';
import { getLoginFailureReason } from '@/lib/login-failure-reason';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * POST /api/auth/login-failure-reason
 * Returns the reason for the last login failure for the given email (e.g. "locked"),
 * so the client can show the correct message. Uses DB for locked check so it works
 * across serverless/instances; in-memory store is used as fallback if set.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email) {
      return NextResponse.json({ reason: null }, { status: 200 });
    }

    let reason: string | null = getLoginFailureReason(email);
    if (reason === null) {
      await connectDB();
      const user = await User.findOne({ email }).select('isLocked').lean();
      if (user?.isLocked) reason = 'locked';
    }
    return NextResponse.json({ reason });
  } catch {
    return NextResponse.json({ reason: null }, { status: 200 });
  }
}
