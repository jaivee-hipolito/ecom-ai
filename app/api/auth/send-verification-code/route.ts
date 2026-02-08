import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import { sendVerificationSMS } from '@/lib/sms';
import { normalizePhoneNumber } from '@/lib/phone';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phoneNumber, type } = body; // type: 'email' or 'phone'

    if (!type || (type !== 'email' && type !== 'phone')) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification type. Must be "email" or "phone"' },
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

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (type === 'email') {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found. Please register first.' },
          { status: 404 }
        );
      }

      // Update user with email verification code
      user.emailVerificationCode = verificationCode;
      user.emailVerificationCodeExpires = expiresAt;
      await user.save();

      // Send email with verification code
      const emailSent = await sendVerificationEmail(email, verificationCode);

      // In development mode, also log the code for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`Email verification code for ${email}: ${verificationCode}`);
      }

      // If email service is not configured, still allow registration but warn
      if (!emailSent && process.env.NODE_ENV === 'production') {
        console.error('Failed to send verification email. Email service may not be configured.');
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Verification code sent to your email',
          // Only return code in development mode for testing
          ...(process.env.NODE_ENV === 'development' && { code: verificationCode }),
        },
        { status: 200 }
      );
    } else {
      // Phone verification - normalize phone number before lookup
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
      let user = await User.findOne({ contactNumber: normalizedPhoneNumber });

      // If not found with normalized, try original format (for backward compatibility)
      if (!user) {
        user = await User.findOne({ contactNumber: phoneNumber });
        
        // If found with original format, update to normalized format for future queries
        if (user) {
          user.contactNumber = normalizedPhoneNumber;
          await user.save();
        }
      }

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found. Please register first.' },
          { status: 404 }
        );
      }

      // Update user with phone verification code
      user.phoneVerificationCode = verificationCode;
      user.phoneVerificationCodeExpires = expiresAt;
      await user.save();

      // Send SMS with verification code
      const smsSent = await sendVerificationSMS(phoneNumber, verificationCode);

      // In development mode, also log the code for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`Phone verification code for ${phoneNumber}: ${verificationCode}`);
      }

      // If SMS service is not configured, still allow registration but warn
      if (!smsSent && process.env.NODE_ENV === 'production') {
        console.error('Failed to send verification SMS. SMS service may not be configured.');
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Verification code sent to your phone',
          // Only return code in development mode for testing
          ...(process.env.NODE_ENV === 'development' && { code: verificationCode }),
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Send verification code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send verification code',
      },
      { status: 500 }
    );
  }
}
