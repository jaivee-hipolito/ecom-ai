import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';

function normalizeKey(k: string): string {
  return String(k)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeVal(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.map(normalizeVal).join(',');
  return String(v).toLowerCase().trim();
}

function variantMatchesSelection(
  variantAttrs: Record<string, unknown>,
  selected: Record<string, unknown>
): boolean {
  const specOnlyKeys = new Set(['madeof', 'origin', 'classification', 'with']);
  const vMap = new Map<string, string>();
  for (const [k, val] of Object.entries(variantAttrs)) {
    if (val == null) continue;
    const nk = normalizeKey(k);
    vMap.set(nk, normalizeVal(val));
  }
  for (const [key, selectedVal] of Object.entries(selected)) {
    if (selectedVal == null) continue;
    const nk = normalizeKey(key);
    if (specOnlyKeys.has(nk)) continue;
    const vVal = vMap.get(nk);
    const want = normalizeVal(selectedVal);
    if (vVal === undefined) {
      console.log(`  ❌ Key "${key}" (normalized: "${nk}") not found in variant. Variant keys:`, Array.from(vMap.keys()));
      return false;
    }
    if (vVal === want) continue;
    if (vVal.includes(',') && vVal.split(',').map((s) => s.trim()).includes(want)) continue;
    console.log(`  ❌ Value mismatch for "${key}": variant has "${vVal}", selected wants "${want}"`);
    return false;
  }
  return true;
}

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
    const { productId, quantity, selectedAttributes } = await request.json();

    console.log('📦 Cart POST received:', {
      productId,
      quantity,
      selectedAttributes,
      selectedAttributesKeys: selectedAttributes ? Object.keys(selectedAttributes) : [],
    });

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Resolve variant by selected attributes (same name = variants)
    let resolvedProductId = productId;
    if (
      selectedAttributes &&
      typeof selectedAttributes === 'object' &&
      Object.keys(selectedAttributes).length > 0
    ) {
      const productName = (product.name && String(product.name).trim()) || '';
      const nameEscaped = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`^${nameEscaped}$`, 'i');
      const variants = await Product.find({ name: nameRegex })
        .select('_id attributes stock price images coverImage')
        .lean();
      console.log('🔍 Variant resolution:', {
        productName,
        variantCount: variants.length,
        variantIds: (variants as any[]).map((v) => v._id.toString()),
        variantAttributes: (variants as any[]).map((v) => ({
          id: v._id.toString(),
          attrs: v.attributes || {},
        })),
        selectedAttributes: selectedAttributes,
      });
      const selected = selectedAttributes as Record<string, unknown>;
      const matched = (variants as any[]).find((v: any) => {
        console.log(`  🔎 Checking variant ${v._id.toString()}:`, v.attributes || {});
        const matches = variantMatchesSelection((v.attributes || {}) as Record<string, unknown>, selected);
        console.log(`  ${matches ? '✅' : '❌'} Variant ${v._id.toString()} ${matches ? 'MATCHES' : 'does not match'}`);
        return matches;
      });
      if (matched) {
        resolvedProductId = (matched as any)._id.toString();
        console.log('✅ Matched variant:', {
          matchedId: resolvedProductId,
          matchedAttributes: (matched as any).attributes || {},
        });
      } else {
        console.log('❌ No variant match found, using original productId:', productId);
      }
    }

    const variantProduct = await Product.findById(resolvedProductId).lean();
    if (!variantProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if ((variantProduct.stock ?? 0) < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    const selectedForStorage =
      selectedAttributes &&
      typeof selectedAttributes === 'object' &&
      Object.keys(selectedAttributes).length > 0
        ? (selectedAttributes as Record<string, unknown>)
        : undefined;
    console.log('💾 Storing in cart:', {
      resolvedProductId,
      selectedForStorage,
      variantProductAttributes: variantProduct.attributes || {},
    });

    let cart = await Cart.findOne({ user: userId });

    const itemPayload: any = {
      product: resolvedProductId,
      quantity,
    };
    if (selectedForStorage && Object.keys(selectedForStorage).length > 0) {
      itemPayload.selectedAttributes = JSON.parse(JSON.stringify(selectedForStorage));
    }

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [itemPayload],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.product.toString() === resolvedProductId
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > (variantProduct.stock ?? 0)) {
          return NextResponse.json(
            { error: 'Insufficient stock available' },
            { status: 400 }
          );
        }
        cart.items[existingItemIndex].quantity = newQuantity;
        if (selectedForStorage && Object.keys(selectedForStorage).length > 0) {
          (cart.items[existingItemIndex] as any).selectedAttributes = JSON.parse(JSON.stringify(selectedForStorage));
        }
      } else {
        cart.items.push(itemPayload);
      }
      cart.markModified('items');
      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    const postValidItems = (populatedCart!.items as any[]).filter(
      (item: any) => item.product != null
    );

    return NextResponse.json(
      {
        ...populatedCart!.toObject(),
        _id: populatedCart!._id.toString(),
        user: populatedCart!.user.toString(),
        items: postValidItems.map((item: any) => {
          const itemObj = item.toObject ? item.toObject() : item;
          return {
            ...itemObj,
            selectedAttributes: itemObj.selectedAttributes ?? item.selectedAttributes ?? null,
            product: typeof item.product === 'object' && item.product
              ? { ...item.product.toObject(), _id: item.product._id.toString() }
              : item.product,
          };
        }),
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
    const delValidItems = (populatedCart!.items as any[]).filter(
      (item: any) => item.product != null
    );

    return NextResponse.json({
      ...populatedCart!.toObject(),
      _id: populatedCart!._id.toString(),
      user: populatedCart!.user.toString(),
      items: delValidItems.map((item: any) => {
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
