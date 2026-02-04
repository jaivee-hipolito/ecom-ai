import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Filter out items with null or deleted products
    const validItems = cart.items.filter((item: any) => {
      return item.product !== null && item.product !== undefined;
    });

    // If there are invalid items, update the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    return NextResponse.json({
      ...cart.toObject(),
      _id: cart._id.toString(),
      user: cart.user.toString(),
      items: validItems.map((item: any) => ({
        ...item.toObject(),
        product: typeof item.product === 'object' && item.product
          ? {
              ...item.product.toObject(),
              _id: item.product._id.toString(),
            }
          : item.product,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          return NextResponse.json(
            { error: 'Insufficient stock available' },
            { status: 400 }
          );
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json(
      {
        ...populatedCart!.toObject(),
        _id: populatedCart!._id.toString(),
        user: populatedCart!.user.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
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
      const product = await Product.findById(productId);
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

    return NextResponse.json({
      ...populatedCart!.toObject(),
      _id: populatedCart!._id.toString(),
      user: populatedCart!.user.toString(),
    });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

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

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    return NextResponse.json({
      ...populatedCart!.toObject(),
      _id: populatedCart!._id.toString(),
      user: populatedCart!.user.toString(),
    });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
