import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { ProductFilters, PaginationParams, ProductListResponse } from '@/types/product';
import mongoose from 'mongoose';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category')?.trim() || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const isFlashSale = searchParams.get('isFlashSale') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter query
    const filter: any = {};
    if (category) {
      // Category can be either a name or an ID
      // First, try to find the category by name or ID
      let categoryId: string | null = null;
      
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = category;
      } else {
        // It's a category name, look it up
        const categoryDoc = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, 'i') }
        }).select('_id').lean();
        
        if (categoryDoc) {
          categoryId = categoryDoc._id.toString();
        } else {
          // Category not found, return empty results
          return NextResponse.json({
            products: [],
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
          });
        }
      }
      
      // Filter by category ID
      filter.category = categoryId;
      console.log('Filtering by category ID:', categoryId);
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    if (featured !== undefined) filter.featured = featured;
    if (isFlashSale !== undefined) filter.isFlashSale = isFlashSale;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    // Only show products with stock > 0 for customers
    filter.stock = { $gt: 0 };

    // Build sort object (views = highest first when sortOrder desc)
    const sort: any = {};
    if (sortBy === 'views') {
      sort.views = sortOrder === 'asc' ? 1 : -1;
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const [total, uniqueNameResult] = await Promise.all([
      Product.countDocuments(filter),
      Product.aggregate([
        { $match: filter },
        { $group: { _id: '$name' } },
        { $count: 'value' },
      ]).exec(),
    ]);
    const totalUniqueNames = uniqueNameResult?.[0]?.value ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Fetch products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Filter:', JSON.stringify(filter, null, 2));
    console.log('Found products:', products.length);

    // Collect unique category IDs
    const categoryIds = [
      ...new Set(
        products
          .map((p) => p.category)
          .filter((cat) => cat && typeof cat === 'string' && mongoose.Types.ObjectId.isValid(cat))
      ),
    ];

    // Fetch all categories at once for better performance
    const categories = await Category.find({
      _id: { $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)) } as any,
    })
      .select('_id name')
      .lean();

    // Create a map of category ID to name
    const categoryMap = new Map(
      categories.map((cat) => [cat._id.toString(), cat.name])
    );

    // Populate category names for all products
    const productsWithCategoryNames = products.map((p) => {
      let categoryName = p.category;
      // Check if category is an ObjectId string and we have it in our map
      if (
        p.category &&
        typeof p.category === 'string' &&
        mongoose.Types.ObjectId.isValid(p.category)
      ) {
        categoryName = categoryMap.get(p.category) || p.category;
      }
      return {
        ...p,
        _id: p._id.toString(),
        category: categoryName,
      };
    });

    const response: ProductListResponse = {
      products: productsWithCategoryNames,
      total,
      totalUniqueNames,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
