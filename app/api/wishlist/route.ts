import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/wishlist
 * Fetch user's wishlist with populated products
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      select: 'name description price images coverImage stock rating numReviews category attributes',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    return NextResponse.json({
      _id: wishlist._id.toString(),
      user: wishlist.user.toString(),
      products: wishlist.products.map((p: any) => ({
        ...(typeof p === 'object' ? p.toObject() : {}),
        _id: typeof p === 'object' ? p._id.toString() : p.toString(),
      })),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Add product to wishlist (productId in request body)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

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
 * DELETE /api/wishlist
 * Remove product from wishlist (productId in request body)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

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
