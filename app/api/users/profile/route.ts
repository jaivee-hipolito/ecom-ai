import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const user = await User.findById((session.user as any).id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle migration: if user has old "name" field but no firstName/lastName
    let firstName = user.firstName;
    let lastName = user.lastName;
    let contactNumber = user.contactNumber || '';

    if ((user as any).name && !firstName && !lastName) {
      const nameParts = ((user as any).name as string).trim().split(' ');
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = '';
      }
      
      // Auto-migrate: Update the user document
      await User.findByIdAndUpdate(user._id, {
        firstName,
        lastName,
        contactNumber: contactNumber || '',
      });
    }

    return NextResponse.json({
      user: {
        ...user,
        firstName: firstName || '',
        lastName: lastName || '',
        contactNumber: contactNumber || '',
        emailVerified: (user as any).emailVerified || false,
        phoneVerified: (user as any).phoneVerified || false,
        _id: user._id.toString(),
        createdAt: user.createdAt?.toISOString(),
        updatedAt: user.updatedAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const body = await request.json();
    const { firstName, lastName, contactNumber, email, password, currentPassword, image } = body;
    const userId = (session.user as any).id;

    // Get current user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Handle migration: if user has old "name" field but no firstName/lastName, migrate it first
    if ((user as any).name && !user.firstName && !user.lastName) {
      const nameParts = ((user as any).name as string).trim().split(' ');
      if (nameParts.length >= 2) {
        user.firstName = nameParts[0];
        user.lastName = nameParts.slice(1).join(' ');
      } else if (nameParts.length === 1) {
        user.firstName = nameParts[0];
        user.lastName = '';
      }
    }

    // Update firstName if provided
    if (firstName !== undefined && firstName !== null && firstName !== '') {
      user.firstName = firstName.trim();
    } else if (!user.firstName) {
      user.firstName = '';
    }

    // Update lastName if provided
    if (lastName !== undefined && lastName !== null && lastName !== '') {
      user.lastName = lastName.trim();
    } else if (!user.lastName) {
      user.lastName = '';
    }

    // Update contactNumber if provided
    if (contactNumber !== undefined && contactNumber !== null && contactNumber !== '') {
      user.contactNumber = contactNumber.trim();
    } else if (!user.contactNumber) {
      user.contactNumber = '';
    }

    // Update email if provided
    if (email !== undefined && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
      user.email = email.toLowerCase().trim();
    }

    // Update password if provided
    if (password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      if (!user.password) {
        return NextResponse.json(
          { error: 'User does not have a password set' },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Hash new password
      user.password = await bcrypt.hash(password, 12);
    }

    // Update image if provided
    if (image !== undefined) {
      user.image = image;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password').lean();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        _id: updatedUser!._id.toString(),
        createdAt: updatedUser!.createdAt?.toISOString(),
        updatedAt: updatedUser!.updatedAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

