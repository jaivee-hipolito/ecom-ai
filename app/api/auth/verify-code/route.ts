import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { normalizePhoneNumber } from '@/lib/phone';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phoneNumber, code, type } = body; // type: 'email' or 'phone'

    if (!code || !type || (type !== 'email' && type !== 'phone')) {
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
      user = await User.findOne({ email: email.toLowerCase() }).select('+emailVerificationCode +phoneVerificationCode +emailVerificationCodeExpires +phoneVerificationCodeExpires');
    } else {
      // For phone verification, try normalized first, then original format as fallback
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      user = await User.findOne({ contactNumber: normalizedPhone }).select('+emailVerificationCode +phoneVerificationCode +emailVerificationCodeExpires +phoneVerificationCodeExpires');
      
      // If not found with normalized, try original format (for backward compatibility)
      if (!user) {
        user = await User.findOne({ contactNumber: phoneNumber }).select('+emailVerificationCode +phoneVerificationCode +emailVerificationCodeExpires +phoneVerificationCodeExpires');
        
        // If found with original format, update to normalized format for future queries
        if (user) {
          user.contactNumber = normalizedPhone;
          await user.save();
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (type === 'email') {
      // Check if code matches
      if (user.emailVerificationCode !== code) {
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
      
      if (user.phoneVerificationCode !== code) {
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
  } catch (error: any) {
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
