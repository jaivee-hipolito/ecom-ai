import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate MongoDB ObjectId format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Increment view count
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: product.views,
    });
  } catch (error: any) {
    console.error('Error tracking product view:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track product view' },
      { status: 500 }
    );
  }
}


