import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { RegisterData, AuthResponse } from '@/types/auth';
import { normalizePhoneNumber } from '@/lib/phone';
import { isValidPassword, PASSWORD_REQUIREMENT_MESSAGE } from '@/lib/password';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const contactNumber = typeof body.contactNumber === 'string' ? body.contactNumber.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const missing: string[] = [];
    if (!firstName) missing.push('First name');
    if (!lastName) missing.push('Last name');
    if (!contactNumber) missing.push('Contact number');
    if (!email) missing.push('Email');
    if (!password) missing.push('Password');
    if (missing.length > 0) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: `Missing required fields: ${missing.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: PASSWORD_REQUIREMENT_MESSAGE,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Normalize phone number before storing
    const normalizedContactNumber = normalizePhoneNumber(contactNumber);

    // Create user (unverified initially)
    const user = await User.create({
      firstName,
      lastName,
      contactNumber: normalizedContactNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      emailVerified: false,
      phoneVerified: false,
    });

    // Remove password from response
    const userResponse = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your email and phone number.',
        user: userResponse,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: error.message || 'Registration failed',
      },
      { status: 500 }
    );
  }
}
