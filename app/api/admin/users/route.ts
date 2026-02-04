import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Ensure we return JSON even if requireAdmin fails
    try {
    await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;

    // Build filter query
    const filter: any = {};
    
    // Filter by role (default to customers only, but allow filtering)
    if (role) {
      filter.role = role;
    } else {
      // By default, show all users (both admin and customer)
      // Admin can see everyone
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch users (exclude password)
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        _id: u._id.toString(),
        createdAt: u.createdAt?.toISOString(),
        updatedAt: u.updatedAt?.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure we return JSON even if requireAdmin fails
  try {
    await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { firstName, lastName, contactNumber, email, password, role } = body;

    // Validation
    if (!firstName || !lastName || !contactNumber || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !['admin', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "admin" or "customer"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (default to customer if role not specified)
    let user;
    try {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'customer',
    });
    } catch (createError: any) {
      // Handle Mongoose validation errors specifically
      if (createError.name === 'ValidationError') {
        const validationErrors = Object.values(createError.errors || {}).map((err: any) => err.message);
        return NextResponse.json(
          { error: validationErrors.join(', ') || 'Validation failed' },
          { status: 400 }
        );
      }
      // Re-throw to be caught by outer catch
      throw createError;
    }

    // Remove password from response
    const userResponse = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') || 'Validation failed' },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

