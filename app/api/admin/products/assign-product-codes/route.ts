import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { getNextProductCode } from '@/lib/productCode';

export const runtime = 'nodejs';

/**
 * POST /api/admin/products/assign-product-codes
 * Admin-only: find all products without a productCode (missing, null, or empty)
 * and assign an auto-generated code per category (PREFIX-00001 style).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const productsWithoutCode = await Product.find({
      $or: [
        { productCode: { $exists: false } },
        { productCode: null },
        { productCode: '' },
        { productCode: { $regex: /^\s*$/ } },
      ],
    })
      .select('_id category name')
      .lean();

    const results: { _id: string; name: string; productCode: string }[] = [];

    for (const product of productsWithoutCode) {
      const categoryIdOrName = product.category ?? '';
      const productCode = await getNextProductCode(categoryIdOrName);
      await Product.updateOne(
        { _id: product._id },
        { $set: { productCode } }
      );
      results.push({
        _id: String(product._id),
        name: product.name ?? '',
        productCode,
      });
    }

    return NextResponse.json({
      message: `Assigned product codes to ${results.length} product(s).`,
      updated: results.length,
      productCodes: results,
    });
  } catch (error: any) {
    console.error('Assign product codes error:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to assign product codes' },
      { status: 500 }
    );
  }
}
