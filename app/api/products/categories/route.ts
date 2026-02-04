import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .sort({ name: 1 })
      .select('name description slug')
      .lean();

    return NextResponse.json({
      categories: categories.map((cat) => ({
        _id: cat._id.toString(),
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
