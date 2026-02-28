import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const trimmed = query.trim();
    const products = await Product.find({
      $or: [
        { name: { $regex: trimmed, $options: 'i' } },
        { description: { $regex: trimmed, $options: 'i' } },
        { category: { $regex: trimmed, $options: 'i' } },
        // Product code: exact match (case-insensitive) so "TJ-1001" finds the product
        ...(trimmed.length > 0 ? [{ productCode: { $regex: `^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }] : []),
      ],
      stock: { $gt: 0 }, // Only show products in stock
    })
      .limit(limit)
      .select('name price images coverImage category productCode')
      .lean();

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        _id: p._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}
