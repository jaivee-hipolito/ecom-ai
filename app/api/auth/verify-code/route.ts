import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { normalizePhoneNumber } from '@/lib/phone';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phoneNumber, type } = body; // type: 'email' or 'phone'
    // Normalize code to string and trim (avoid type/whitespace mismatch after resend)
    const code = typeof body.code === 'string' || typeof body.code === 'number'
      ? String(body.code).trim().replace(/\D/g, '')
      : '';

    if (!code || code.length !== 6 || !type || (type !== 'email' && type !== 'phone')) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification data' },
        { status: 400 }
      );
    }

    if (type === 'email' && !email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (type === 'phone' && !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let user;
    if (type === 'email') {
      // Email verification: use session so we always update the logged-in user (persists across refresh)
      const session = await requireAuth().catch(() => null);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'You must be signed in to verify your email' },
          { status: 401 }
        );
      }
      const userId = (session.user as any).id;
      const requestEmail = (email as string || '').toLowerCase().trim();
      user = await User.findById(userId).select('+email +emailVerificationCode +phoneVerificationCode +emailVerificationCodeExpires +phoneVerificationCodeExpires');
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      const userEmail = ((user as any).email || '').toLowerCase();
      if (userEmail !== requestEmail) {
        return NextResponse.json(
          { success: false, error: 'Email does not match your account' },
          { status: 400 }
        );
      }
    } else {
      // Phone verification: use session so we always update the logged-in user (persists across refresh)
      const session = await requireAuth().catch(() => null);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'You must be signed in to verify your phone' },
          { status: 401 }
        );
      }
      const userId = (session.user as any).id;
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      user = await User.findById(userId).select('+contactNumber +emailVerificationCode +phoneVerificationCode +emailVerificationCodeExpires +phoneVerificationCodeExpires');
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      const userPhoneNormalized = normalizePhoneNumber((user as any).contactNumber || '');
      if (userPhoneNormalized !== normalizedPhone) {
        return NextResponse.json(
          { success: false, error: 'Phone number does not match your account' },
          { status: 400 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (type === 'email') {
      // Check if code matches (compare as strings, stored value may be string or number)
      const storedEmailCode = user.emailVerificationCode != null ? String(user.emailVerificationCode).trim() : '';
      if (storedEmailCode !== code) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Check if code expired
      if (!user.emailVerificationCodeExpires || user.emailVerificationCodeExpires < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Mark email as verified
      user.emailVerified = true;
      user.emailVerificationCode = undefined;
      user.emailVerificationCodeExpires = undefined;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Email verified successfully',
        },
        { status: 200 }
      );
    } else {
      // Phone verification
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Phone verification attempt:', {
          phoneNumber: phoneNumber,
          normalizedPhone: normalizePhoneNumber(phoneNumber),
          storedCode: user.phoneVerificationCode,
          providedCode: code,
          codesMatch: user.phoneVerificationCode === code,
        });
      }
      
      const storedPhoneCode = user.phoneVerificationCode != null ? String(user.phoneVerificationCode).trim() : '';
      if (storedPhoneCode !== code) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Check if code expired
      if (!user.phoneVerificationCodeExpires || user.phoneVerificationCodeExpires < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Mark phone as verified
      user.phoneVerified = true;
      user.phoneVerificationCode = undefined;
      user.phoneVerificationCodeExpires = undefined;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: 'Phone number verified successfully',
        },
        { status: 200 }
      );
    }
  }
  catch (error: any) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify code',
      },
      { status: 500 }
    );
  }
}

