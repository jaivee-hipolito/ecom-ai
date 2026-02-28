import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { getNextProductCode } from '@/lib/productCode';

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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product.toObject(),
      _id: product._id.toString(),
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, productCode, images, coverImage, stock, featured, attributes, isFlashSale, flashSaleDiscount, flashSaleDiscountType } = body;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category) product.category = category;
    if (productCode !== undefined) {
      const trimmed = productCode?.trim() || undefined;
      if (trimmed) {
        product.productCode = trimmed;
      } else if (!product.productCode) {
        // Auto-generate when product has no code and none was provided
        product.productCode = await getNextProductCode(product.category);
      }
    }
    
    // Handle images and coverImage
    if (images !== undefined) {
      const imageArray = Array.isArray(images) ? images : [images];
      product.images = imageArray;
    }
    
    // Always update coverImage if provided
    if (coverImage !== undefined) {
      const imageArray = product.images || [];
      if (coverImage && imageArray.includes(coverImage)) {
        product.coverImage = coverImage;
      } else if (imageArray.length > 0) {
        // If coverImage is not in images array, use first image as fallback
        product.coverImage = imageArray[0];
      } else {
        product.coverImage = '';
      }
    } else if (images !== undefined) {
      // If images changed but coverImage not provided, ensure coverImage is valid
      const imageArray = product.images || [];
      if (imageArray.length > 0) {
        // If current coverImage is not in new images array, use first image
        if (!product.coverImage || !imageArray.includes(product.coverImage)) {
          product.coverImage = imageArray[0];
        }
      }
    }
    
    if (stock !== undefined) product.stock = parseInt(stock);
    if (featured !== undefined) product.featured = featured;
    if (isFlashSale !== undefined) {
      product.isFlashSale = isFlashSale;
      // If disabling flash sale, clear discount fields
      if (!isFlashSale) {
        product.flashSaleDiscount = 0;
        product.flashSaleDiscountType = 'percentage';
      }
    }
    // Update flash sale discount fields if provided in request body
    if (flashSaleDiscount !== undefined) {
      product.flashSaleDiscount = parseFloat(flashSaleDiscount) || 0;
    }
    if (flashSaleDiscountType !== undefined) {
      product.flashSaleDiscountType = flashSaleDiscountType;
    }
    if (attributes !== undefined) product.attributes = attributes;

    await product.save();

    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        ...product.toObject(),
        _id: product._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
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
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary before deleting the product
    if (product.images && product.images.length > 0) {
      const { deleteImage, extractPublicIdFromUrl } = await import('@/lib/cloudinary');
      
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

    // Delete the product from database
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
