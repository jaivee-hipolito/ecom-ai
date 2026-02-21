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
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function getCooldownRemainingMs(sentAt: Date | undefined): number {
  if (!sentAt) return 0;
  const elapsed = Date.now() - new Date(sentAt).getTime();
  return Math.max(0, RESEND_COOLDOWN_MS - elapsed);
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
      // Find user by email (include sent-at for cooldown)
      const user = await User.findOne({ email: email.toLowerCase() }).select('+emailVerificationCodeSentAt');

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found. Please register first.' },
          { status: 404 }
        );
      }

      const cooldownMs = getCooldownRemainingMs((user as any).emailVerificationCodeSentAt);
      if (cooldownMs > 0) {
        const minutesLeft = Math.ceil(cooldownMs / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} before requesting another code.`,
            cooldownSeconds: Math.ceil(cooldownMs / 1000),
          },
          { status: 429 }
        );
      }

      // Update user with email verification code
      user.emailVerificationCode = verificationCode;
      user.emailVerificationCodeExpires = expiresAt;
      (user as any).emailVerificationCodeSentAt = new Date();
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
      // Phone verification: use session so we save the code to the logged-in user (same doc we check on verify)
      const session = await requireAuth().catch(() => null);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'You must be signed in to request a phone verification code.' },
          { status: 401 }
        );
      }
      const userId = (session.user as any).id;
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found.' },
          { status: 404 }
        );
      }
      const userPhone = normalizePhoneNumber((user as any).contactNumber || '');
      const requestedPhone = normalizePhoneNumber(phoneNumber);
      if (userPhone !== requestedPhone) {
        return NextResponse.json(
          { success: false, error: 'Phone number does not match your account.' },
          { status: 400 }
        );
      }

      const cooldownMs = getCooldownRemainingMs((user as any).phoneVerificationCodeSentAt);
      if (cooldownMs > 0) {
        const minutesLeft = Math.ceil(cooldownMs / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Please wait ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} before requesting another code.`,
            cooldownSeconds: Math.ceil(cooldownMs / 1000),
          },
          { status: 429 }
        );
      }

      // Save code to the logged-in user's document (same one verify-code will read)
      user.phoneVerificationCode = verificationCode;
      user.phoneVerificationCodeExpires = expiresAt;
      (user as any).phoneVerificationCodeSentAt = new Date();
      await user.save();

      const smsResult = await sendVerificationSMS((user as any).contactNumber || phoneNumber, verificationCode);

      if (process.env.NODE_ENV === 'development') {
        console.log(`Phone verification code for ${(user as any).contactNumber}: ${verificationCode}`);
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
