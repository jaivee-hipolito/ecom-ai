/**
 * Dev-only: set a user's password from the browser so encoding matches login.
 * POST /api/auth/set-local-password with { "email": "...", "password": "..." }
 * Only available when NODE_ENV === 'development'.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { isValidPassword } from '@/lib/password';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password.trim().normalize('NFC') : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing email or password' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 12 characters with 2+ letters, 2+ numbers, 2+ special characters.' },
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ success: false, message: 'Database not connected' }, { status: 503 });
    }
    const users = db.collection('users');

    const user = await users.findOne(
      { email },
      { sort: { _id: 1 } }
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No user found with this email' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await users.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated. You can now log in with this email and password.',
    });
  } catch (err) {
    console.error('[set-local-password]', err);
    return NextResponse.json(
      { success: false, message: 'Failed to update password' },
      { status: 500 }
    );
  }
}
