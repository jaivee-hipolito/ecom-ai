import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const categoryObj = category.toObject();

    return NextResponse.json({
      ...categoryObj,
      _id: category._id.toString(),
      attributes: categoryObj.attributes || [],
    });
  } catch (error: any) {
    console.error('Error fetching category:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, attributes } = body;

    console.log('PUT /api/admin/categories/[id]: Received data:', {
      name,
      description,
      attributes: JSON.stringify(attributes, null, 2),
    });

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    
    // Check if name is being changed and if it conflicts
    if (name && name !== category.name) {
      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [{ name }, { slug }],
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }

      // Update name and slug
      updateData.name = name;
      updateData.slug = slug;
    }
    
    if (description !== undefined) updateData.description = description;
    
    // Update attributes - always update if provided (including empty array to clear attributes)
    if (attributes !== undefined) {
      const attributesArray = Array.isArray(attributes) ? attributes : [];
      console.log('PUT /api/admin/categories/[id]: Setting attributes:', JSON.stringify(attributesArray, null, 2));
      updateData.attributes = attributesArray;
    }

    console.log('PUT /api/admin/categories/[id]: Update data:', JSON.stringify(updateData, null, 2));

    // Use findByIdAndUpdate for more reliable nested array updates
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log('PUT /api/admin/categories/[id]: Category updated successfully. Attributes from DB:', JSON.stringify(updatedCategory.attributes, null, 2));

    const categoryObj = updatedCategory.toObject();

    return NextResponse.json({
      message: 'Category updated successfully',
      category: {
        ...categoryObj,
        _id: updatedCategory._id.toString(),
        attributes: categoryObj.attributes || [],
      },
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
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
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    
    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Check if category is used by any products
    const Product = (await import('@/models/Product')).default;
    const productsCount = await Product.countDocuments({
      category: id,
    });

    if (productsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It is used by ${productsCount} product(s).`,
        },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

