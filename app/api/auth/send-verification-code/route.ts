/**
 * Send verification code (email or phone).
 * Requires: RESEND_API_KEY (and EMAIL_FROM optional) for email;
 *           TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER for SMS.
 * In development, the code is also returned in the response so you can verify without email/SMS configured.
 */
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
      const emailResult = await sendVerificationEmail(email, verificationCode);

      // In development mode, also log the code for testing
      if (process.env.NODE_ENV === 'development') {
        console.log(`Email verification code for ${email}: ${verificationCode}`);
      }

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error: emailResult.error || 'Failed to send verification email',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Verification code sent to your email',
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

      const smsResult = await sendVerificationSMS(phoneNumber, verificationCode);

      if (process.env.NODE_ENV === 'development') {
        console.log(`Phone verification code for ${phoneNumber}: ${verificationCode}`);
      }

      if (!smsResult.success) {
        console.error('Failed to send verification SMS:', smsResult.error);
        return NextResponse.json(
          {
            success: false,
            error: smsResult.error || 'Failed to send verification SMS',
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Verification code sent to your phone',
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
