import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();

    // Handle both Next.js 15 (Promise) and older versions
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('Fetching product with ID:', productId);

    const product = await Product.findById(productId).lean();

    if (!product) {
      console.log('Product not found for ID:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch all variants (products with the same name)
    const variants = await Product.find({ name: product.name })
      .select('_id attributes stock price images coverImage')
      .lean();

    // Fetch category name and attributes if category is an ObjectId
    let categoryName = product.category;
    let categoryAttributes: any[] = [];
    if (product.category && typeof product.category === 'string') {
      // Check if it's a valid ObjectId
      const mongoose = await import('mongoose');
      if (mongoose.default.Types.ObjectId.isValid(product.category)) {
        const categoryDoc = await Category.findById(product.category)
          .select('name attributes')
          .lean();
        if (categoryDoc) {
          categoryName = categoryDoc.name;
          categoryAttributes = categoryDoc.attributes || [];
        }
      }
    }

    // Increment view count (don't block the response)
    Product.findByIdAndUpdate(productId, { $inc: { views: 1 } }).catch((err) =>
      console.error('Error incrementing view count:', err)
    );

    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
      category: categoryName, // Replace ObjectId with category name
      categoryId: typeof product.category === 'object' && product.category !== null ? String(product.category) : String(product.category || ''), // Keep original ID if needed
      categoryAttributes, // Include category attributes for rendering
      variants: variants.map((v: any) => ({
        _id: v._id.toString(),
        attributes: v.attributes || {},
        stock: v.stock || 0,
        price: v.price || 0,
        images: v.images || [],
        coverImage: v.coverImage || '',
      })),
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    // Check if it's an invalid ObjectId error
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
