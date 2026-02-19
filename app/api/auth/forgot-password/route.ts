import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetCodeEmail } from '@/lib/email';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

// Generate 6-digit code (same as send-verification-code)
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawEmail = body?.email;
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with that email exists, a password reset code has been sent.',
        },
        { status: 200 }
      );
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.password) {
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with that email exists, a password reset code has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate 6-digit code (same approach as email verification)
    const resetCode = generateResetCode();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to user (reuse resetPasswordToken field for the code)
    user.resetPasswordToken = resetCode;
    user.resetPasswordTokenExpires = resetCodeExpires;
    await user.save();

    // Send via same email flow as verification (sendPasswordResetCodeEmail)
    const emailResult = await sendPasswordResetCodeEmail(email, resetCode);

    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset code for ${email}: ${resetCode}`);
    }

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || 'Failed to send password reset email',
          ...(process.env.NODE_ENV === 'development' && { resetCode }),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.',
        ...(process.env.NODE_ENV === 'development' && { resetCode }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process password reset request',
      },
      { status: 500 }
    );
  }
}
