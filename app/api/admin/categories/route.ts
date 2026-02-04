import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const categories = await Category.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      categories: categories.map((cat) => ({
        ...cat,
        _id: cat._id.toString(),
        attributes: cat.attributes || [],
      })),
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { name, description, attributes } = body;

    console.log('POST /api/admin/categories: Received data:', {
      name,
      description,
      attributes: JSON.stringify(attributes, null, 2),
    });

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Please provide name and description' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Ensure attributes is an array
    const attributesArray = Array.isArray(attributes) ? attributes : [];
    console.log('POST /api/admin/categories: Creating category with attributes:', JSON.stringify(attributesArray, null, 2));

    const category = await Category.create({
      name,
      description,
      slug,
      attributes: attributesArray,
    });

    console.log('POST /api/admin/categories: Category created. Attributes from DB:', JSON.stringify(category.attributes, null, 2));

    const categoryObj = category.toObject();

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category: {
          ...categoryObj,
          _id: category._id.toString(),
          attributes: categoryObj.attributes || [],
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

