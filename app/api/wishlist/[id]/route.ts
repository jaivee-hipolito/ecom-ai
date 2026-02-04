import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/wishlist/[id]
 * Add product to wishlist by product ID in URL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id: productId } = await params;
    const userId = (session.user as any).id;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });
    } else {
      // Check if product already exists in wishlist
      const productExists = wishlist.products.some(
        (p: any) => p.toString() === productId
      );

      if (productExists) {
        return NextResponse.json(
          { error: 'Product already in wishlist' },
          { status: 400 }
        );
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Return populated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name description price images coverImage stock rating numReviews category attributes',
    });

    return NextResponse.json(
      {
        _id: populatedWishlist!._id.toString(),
        user: populatedWishlist!.user.toString(),
        products: populatedWishlist!.products.map((p: any) => ({
          ...p.toObject(),
          _id: p._id.toString(),
        })),
        createdAt: populatedWishlist!.createdAt,
        updatedAt: populatedWishlist!.updatedAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist/[id]
 * Remove product from wishlist by product ID in URL
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const { id: productId } = await params;
    const userId = (session.user as any).id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove product from wishlist
    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (p: any) => p.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      return NextResponse.json(
        { error: 'Product not found in wishlist' },
        { status: 404 }
      );
    }

    await wishlist.save();

    // Return populated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name description price images coverImage stock rating numReviews category attributes',
    });

    return NextResponse.json({
      _id: populatedWishlist!._id.toString(),
      user: populatedWishlist!.user.toString(),
      products: populatedWishlist!.products.map((p: any) => ({
        ...p.toObject(),
        _id: p._id.toString(),
      })),
      createdAt: populatedWishlist!.createdAt,
      updatedAt: populatedWishlist!.updatedAt,
    });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
