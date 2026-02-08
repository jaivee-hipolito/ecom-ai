import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { RegisterData, AuthResponse } from '@/types/auth';
import { normalizePhoneNumber } from '@/lib/phone';

// Force Node.js runtime for MongoDB/Mongoose compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { firstName, lastName, contactNumber, email, password } = body;

    // Validation
    if (!firstName || !lastName || !contactNumber || !email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Please provide all required fields',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Password must be at least 6 characters',
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
