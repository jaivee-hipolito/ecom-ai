import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public API: returns maintenance status and active announcement for guards/banners */
export async function GET() {
  try {
    await connectDB();
    const settings = await SiteSettings.get();

    return NextResponse.json({
      maintenanceMode: !!settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || '',
      maintenanceEndsAt: settings.maintenanceEndsAt
        ? settings.maintenanceEndsAt.toISOString()
        : null,
      announcement: settings.announcementActive ? settings.announcement : '',
      announcementActive: !!settings.announcementActive,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      {
        maintenanceMode: false,
        maintenanceMessage: '',
        maintenanceEndsAt: null,
        announcement: '',
        announcementActive: false,
      },
      { status: 200 }
    );
  }
}
