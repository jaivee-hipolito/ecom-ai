import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

// Force Node.js runtime for MongoDB
export const runtime = 'nodejs';

// Helper function to recalculate totalAmount for BNPL orders that include the fee
function recalculateBNPLTotal(order: any): number {
  const BNPL_FEE_RATE = 0.06; // 6%
  
  // Calculate items total
  const itemsTotal = order.items.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // If items total is 0 or invalid, return original
  if (!itemsTotal || itemsTotal <= 0) {
    return order.totalAmount;
  }

  // Check if stored totalAmount includes the BNPL fee (approximately itemsTotal * 1.06)
  const expectedTotalWithFee = itemsTotal * (1 + BNPL_FEE_RATE);
  const tolerance = 0.10; // Allow small rounding differences
  
  // Check if totalAmount matches the pattern of itemsTotal + 6% fee
  const difference = Math.abs(order.totalAmount - expectedTotalWithFee);
  const isLikelyWithFee = difference < tolerance;
  
  // Check payment method (also handle variations like 'afterpay_clearpay')
  const paymentMethod = (order.paymentMethod || '').toLowerCase();
  const isBNPL = paymentMethod === 'afterpay' || 
                 paymentMethod === 'klarna' || 
                 paymentMethod === 'affirm' ||
                 paymentMethod === 'afterpay_clearpay' ||
                 paymentMethod.includes('afterpay') ||
                 paymentMethod.includes('klarna') ||
                 paymentMethod.includes('affirm');
  
  // If total matches the 6% fee pattern, correct it (regardless of payment method)
  // This ensures order totals never show the BNPL fee, even if paymentMethod wasn't set correctly
  if (isLikelyWithFee) {
    console.log('[orders/[id]/route] ✅ Recalculating order total (removing BNPL fee):', {
      orderId: order._id.toString(),
      paymentMethod: order.paymentMethod,
      isBNPL,
      storedTotal: order.totalAmount,
      itemsTotal,
      expectedWithFee: expectedTotalWithFee,
      difference,
      correctedTotal: itemsTotal,
    });
    return itemsTotal;
  }

  // Already correct or doesn't match expected pattern, return as-is
  return order.totalAmount;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    await connectDB();

    const userId = (session.user as any).id;
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId)
      .populate('items.product')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Ensure the order belongs to the authenticated user
    if (order.user.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Recalculate totalAmount for BNPL orders if needed
    const correctedTotal = recalculateBNPLTotal(order);
    const wasCorrected = correctedTotal !== order.totalAmount;
    
    if (wasCorrected) {
      console.log('[orders/[id]/route] 📊 Order corrected:', {
        orderId: order._id.toString(),
        originalTotal: order.totalAmount,
        correctedTotal,
      });
    }

    return NextResponse.json(
      {
        order: {
          ...order,
          _id: order._id.toString(),
          user: order.user.toString(),
          totalAmount: correctedTotal,
          createdAt: order.createdAt?.toISOString(),
          updatedAt: order.updatedAt?.toISOString(),
          items: order.items.map((item: any) => ({
            ...item,
            // Preserve the image field from the order item, or use product image as fallback
            image: item.image || (item.product && typeof item.product === 'object' 
              ? (item.product.coverImage || item.product.images?.[0] || '')
              : ''),
            product: item.product
              ? typeof item.product === 'object'
                ? {
                    _id: item.product._id.toString(),
                    name: item.product.name,
                    coverImage: item.product.coverImage || item.product.images?.[0] || '',
                    images: item.product.images || [],
                  }
                : item.product.toString()
              : item.product,
          })),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching order:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
