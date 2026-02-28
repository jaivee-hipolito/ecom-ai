import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();
    const { id } = await params;

    const userId = (session.user as any).id;
    const { quantity } = await request.json();

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === id
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock availability
      const product = await Product.findById(id);
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock available' },
          { status: 400 }
        );
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    const putValidItems = (populatedCart!.items as any[]).filter(
      (item: any) => item.product != null
    );

    return NextResponse.json({
      ...populatedCart!.toObject(),
      _id: populatedCart!._id.toString(),
      user: populatedCart!.user.toString(),
      items: putValidItems.map((item: any) => {
        const itemObj = item.toObject ? item.toObject() : item;
        return {
          ...itemObj,
          selectedAttributes: itemObj.selectedAttributes ?? item.selectedAttributes ?? null,
          product: typeof item.product === 'object' && item.product
            ? { ...item.product.toObject(), _id: item.product._id.toString() }
            : item.product,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();
    const { id } = await params;

    const userId = (session.user as any).id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== id
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    // Filter out items with null products
    const validItems = populatedCart!.items.filter((item: any) => {
      return item.product !== null && item.product !== undefined;
    });

    return NextResponse.json({
      ...populatedCart!.toObject(),
      _id: populatedCart!._id.toString(),
      user: populatedCart!.user.toString(),
      items: validItems.map((item: any) => {
        const itemObj = item.toObject ? item.toObject() : item;
        return {
          ...itemObj,
          selectedAttributes: itemObj.selectedAttributes ?? item.selectedAttributes ?? null,
          product: typeof item.product === 'object' && item.product
            ? {
                ...item.product.toObject(),
                _id: item.product._id.toString(),
              }
            : item.product,
        };
      }),
    });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
