import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { productIds, updates } = body;

    // Validation
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one product ID' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one field to update' },
        { status: 400 }
      );
    }

    // Validate product IDs format (MongoDB ObjectId)
    const invalidIds = productIds.filter((id: string) => !id || id.length !== 24);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    
    if (updates.price !== undefined && updates.price !== null && updates.price !== '') {
      const price = parseFloat(updates.price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Invalid price value' },
          { status: 400 }
        );
      }
      updateData.price = price;
    }

    if (updates.category !== undefined && updates.category !== null && updates.category !== '') {
      updateData.category = updates.category;
    }

    if (updates.stock !== undefined && updates.stock !== null && updates.stock !== '') {
      const stock = parseInt(updates.stock);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { error: 'Invalid stock value' },
          { status: 400 }
        );
      }
      updateData.stock = stock;
    }

    if (updates.featured !== undefined && updates.featured !== null) {
      updateData.featured = updates.featured === true || updates.featured === 'true';
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Perform bulk update
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    // Fetch updated products
    const updatedProducts = await Product.find({ _id: { $in: productIds } }).lean();

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} product(s)`,
      modifiedCount: result.modifiedCount,
      products: updatedProducts.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Error performing bulk update:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update products' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { productIds } = body;

    // Validation
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one product ID' },
        { status: 400 }
      );
    }

    // Validate product IDs format (MongoDB ObjectId)
    const invalidIds = productIds.filter((id: string) => !id || id.length !== 24);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Fetch products to delete images from Cloudinary
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Delete images from Cloudinary
    if (products.length > 0) {
      const { deleteImage, extractPublicIdFromUrl } = await import('@/lib/cloudinary');
      
      for (const product of products) {
        if (product.images && product.images.length > 0) {
          for (const imageUrl of product.images) {
            try {
              const publicId = extractPublicIdFromUrl(imageUrl);
              if (publicId) {
                await deleteImage(publicId);
              } else {
                console.warn(`Could not extract public_id from URL: ${imageUrl}`);
              }
            } catch (imageError) {
              console.error(`Failed to delete image ${imageUrl}:`, imageError);
              // Continue deleting other images even if one fails
            }
          }
        }
      }
    }

    // Delete products from database
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} product(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('Error performing bulk delete:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete products' },
      { status: 500 }
    );
  }
}
