/**
 * Deduct or restore product stock when orders are paid/processing or cancelled/refunded.
 * Stock is deducted when the customer pays (order becomes paid/processing).
 * Stock is restored when the order is cancelled or payment is refunded.
 */

import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export interface OrderItemForStock {
  product: string | { _id?: unknown; toString?: () => string };
  quantity: number;
}

/**
 * Get product ID from an order item (handles ObjectId or string).
 */
function getProductId(item: OrderItemForStock): string | null {
  const p = item.product;
  if (!p) return null;
  if (typeof p === 'string') return p;
  if (p._id) return String(p._id);
  if (typeof (p as any).toString === 'function') return (p as any).toString();
  return null;
}

/**
 * Deduct stock for each item in the order. Call when order becomes paid/processing.
 * Uses -qty so inventory DECREASES on purchase. Only call once per order (use stockDeducted flag).
 */
export async function deductStockForOrder(items: OrderItemForStock[]): Promise<void> {
  await connectDB();
  for (const item of items || []) {
    const productId = getProductId(item);
    const qty = Math.abs(Math.max(0, Number(item.quantity) || 0));
    if (!productId || qty === 0) continue;
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty } });
  }
}

/**
 * Restore stock for each item in the order. Call when order is cancelled or refunded.
 * Uses +qty so inventory INCREASES back. Only call once per order (use stockRestored flag).
 */
export async function restoreStockForOrder(items: OrderItemForStock[]): Promise<void> {
  await connectDB();
  for (const item of items || []) {
    const productId = getProductId(item);
    const qty = Math.abs(Math.max(0, Number(item.quantity) || 0));
    if (!productId || qty === 0) continue;
    await Product.findByIdAndUpdate(productId, { $inc: { stock: qty } });
  }
}
