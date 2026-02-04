import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { ProductFilters, PaginationParams, ProductListResponse } from '@/types/product';

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
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;

    // Build filter query
    const filter: any = {};
    if (category) filter.category = category;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    // Handle stock filters
    if (stockStatus) {
      // Stock status filters take priority
      if (stockStatus === 'out-of-stock') {
        filter.stock = 0;
      } else if (stockStatus === 'in-stock') {
        filter.stock = { $gt: 0 };
      } else if (stockStatus === 'low-stock') {
        filter.stock = { $gte: 0, $lt: 10 };
      }
    } else if (minStock !== undefined || maxStock !== undefined) {
      // Min/Max stock filters
      filter.stock = {};
      if (minStock !== undefined) filter.stock.$gte = minStock;
      if (maxStock !== undefined) filter.stock.$lte = maxStock;
    }
    if (featured !== undefined) filter.featured = featured;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const response: ProductListResponse = {
      products: products.map((p) => ({
        ...p,
        _id: p._id.toString(),
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
    const { name, description, price, category, images, coverImage, stock, featured, attributes } = body;

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

        const product = await Product.create({
          name,
          description,
          price: parseFloat(price),
          category,
          images: imageArray,
          coverImage: finalCoverImage,
          stock: parseInt(stock) || 0,
          featured: featured || false,
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
