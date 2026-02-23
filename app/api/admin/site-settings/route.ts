import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const settings = await SiteSettings.get();

    return NextResponse.json({
      maintenanceMode: !!settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || '',
      maintenanceEndsAt: settings.maintenanceEndsAt
        ? settings.maintenanceEndsAt.toISOString()
        : null,
      announcement: settings.announcement || '',
      announcementActive: !!settings.announcementActive,
    });
  } catch (error: any) {
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const {
      maintenanceMode,
      maintenanceMessage,
      maintenanceEndsAt,
      announcement,
      announcementActive,
    } = body;

    const settings = await SiteSettings.get();

    if (typeof maintenanceMode === 'boolean') settings.maintenanceMode = maintenanceMode;
    if (typeof maintenanceMessage === 'string') settings.maintenanceMessage = maintenanceMessage.trim();
    if (maintenanceEndsAt !== undefined) {
      settings.maintenanceEndsAt = maintenanceEndsAt
        ? new Date(maintenanceEndsAt)
        : undefined;
    }
    if (typeof announcement === 'string') settings.announcement = announcement.trim();
    if (typeof announcementActive === 'boolean') settings.announcementActive = announcementActive;

    await settings.save();

    return NextResponse.json({
      maintenanceMode: !!settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || '',
      maintenanceEndsAt: settings.maintenanceEndsAt
        ? settings.maintenanceEndsAt.toISOString()
        : null,
      announcement: settings.announcement || '',
      announcementActive: !!settings.announcementActive,
    });
  } catch (error: any) {
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
