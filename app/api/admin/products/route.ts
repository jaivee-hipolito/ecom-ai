import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { ProductFilters, PaginationParams, ProductListResponse } from '@/types/product';
import { getNextProductCode } from '@/lib/productCode';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;
    const minStock = searchParams.get('minStock')
      ? parseInt(searchParams.get('minStock')!)
      : undefined;
    const maxStock = searchParams.get('maxStock')
      ? parseInt(searchParams.get('maxStock')!)
      : undefined;
    const stockStatus = searchParams.get('stockStatus') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined;
    const isFlashSale = searchParams.get('isFlashSale') === 'true' ? true : searchParams.get('isFlashSale') === 'false' ? false : undefined;
    const search = searchParams.get('search') || undefined;

    const skip = (page - 1) * limit;

    // Build filter. Stock is deducted on pay and restored on cancel/refund, so product.stock = available inventory.
    const filter: any = {};
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (featured !== undefined) filter.featured = featured;
    if (isFlashSale !== undefined) {
      if (isFlashSale === true) filter.isFlashSale = true;
      else filter.isFlashSale = { $ne: true };
    }
    if (search) {
      const searchTrimmed = search.trim();
      filter.$or = [
        { name: { $regex: searchTrimmed, $options: 'i' } },
        { description: { $regex: searchTrimmed, $options: 'i' } },
        { productCode: { $regex: searchTrimmed, $options: 'i' } },
      ];
    }
    if (stockStatus) {
      if (stockStatus === 'out-of-stock') filter.stock = 0;
      else if (stockStatus === 'in-stock') filter.stock = { $gt: 0 };
      else if (stockStatus === 'low-stock') filter.stock = { $gte: 0, $lt: 10 };
    } else if (minStock !== undefined || maxStock !== undefined) {
      filter.stock = {};
      if (minStock !== undefined) filter.stock.$gte = minStock;
      if (maxStock !== undefined) filter.stock.$lte = maxStock;
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const response: ProductListResponse = {
      products: products.map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        availableStock: p.stock ?? 0,
      })),
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { name, description, price, category, productCode, images, coverImage, stock, featured, attributes, isFlashSale, flashSaleDiscount, flashSaleDiscountType } = body;

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one product image' },
        { status: 400 }
      );
    }

    // Validate coverImage is in images array
    const imageArray = Array.isArray(images) ? images : [images];
    const finalCoverImage = coverImage && imageArray.includes(coverImage) 
      ? coverImage 
      : imageArray[0] || '';

    // Auto-generate product code (PREFIX-00001) when not provided
    let finalProductCode = productCode?.trim() || undefined;
    if (!finalProductCode) {
      finalProductCode = await getNextProductCode(category);
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      productCode: finalProductCode,
      images: imageArray,
      coverImage: finalCoverImage,
      stock: parseInt(stock) || 0,
      featured: featured || false,
      isFlashSale: isFlashSale || false,
      flashSaleDiscount: isFlashSale ? (flashSaleDiscount || 0) : 0,
      flashSaleDiscountType: isFlashSale ? (flashSaleDiscountType || 'percentage') : 'percentage',
      attributes: attributes || {},
    });

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: {
          ...product.toObject(),
          _id: product._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
