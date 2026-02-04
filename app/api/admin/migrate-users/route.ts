import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

/**
 * Migration endpoint to convert old "name" field to firstName/lastName
 * and add contactNumber field to existing users
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    // Find all users that have "name" but missing firstName/lastName
    const usersToMigrate = await User.find({
      $or: [
        { name: { $exists: true }, firstName: { $exists: false } },
        { name: { $exists: true }, firstName: '' },
        { firstName: { $exists: false } },
      ],
    });

    let migrated = 0;
    let errors = 0;

    for (const user of usersToMigrate) {
      try {
        const updates: any = {};

        // Migrate name to firstName/lastName
        if ((user as any).name && (!user.firstName || !user.lastName)) {
          const nameParts = ((user as any).name as string).trim().split(' ');
          if (nameParts.length >= 2) {
            updates.firstName = nameParts[0];
            updates.lastName = nameParts.slice(1).join(' ');
          } else if (nameParts.length === 1) {
            updates.firstName = nameParts[0];
            updates.lastName = '';
          }
        }

        // Set default contactNumber if missing
        if (!user.contactNumber) {
          updates.contactNumber = '';
        }

        // Set defaults for firstName/lastName if completely missing
        if (!user.firstName) {
          updates.firstName = updates.firstName || '';
        }
        if (!user.lastName) {
          updates.lastName = updates.lastName || '';
        }

        await User.findByIdAndUpdate(user._id, updates);
        migrated++;
      } catch (error) {
        console.error(`Error migrating user ${user._id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      migrated,
      errors,
      total: usersToMigrate.length,
    });
  } catch (error: any) {
    console.error('Error during migration:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
