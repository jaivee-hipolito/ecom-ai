import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import ProductCodeSequence from '@/models/ProductCodeSequence';
import mongoose from 'mongoose';

const PAD_LENGTH = 5;

/**
 * Derive a 4-character category prefix from category name (e.g. "Rings" -> "RING", "Necklaces" -> "NECK").
 * Uppercase, letters only, first 4 chars; if shorter than 4, pad with 'X'.
 */
export function categoryNameToPrefix(categoryName: string): string {
  if (!categoryName || typeof categoryName !== 'string') return 'PROD';
  const letters = categoryName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = letters.slice(0, 4);
  if (prefix.length === 0) return 'PROD';
  return prefix.padEnd(4, 'X');
}

/**
 * Resolve category identifier (id or name) to category name.
 */
export async function resolveCategoryName(categoryIdOrName: string): Promise<string> {
  await connectDB();
  if (!categoryIdOrName || typeof categoryIdOrName !== 'string') return 'Product';
  const trimmed = categoryIdOrName.trim();
  if (mongoose.Types.ObjectId.isValid(trimmed) && String(new mongoose.Types.ObjectId(trimmed)) === trimmed) {
    const cat = await Category.findById(trimmed).select('name').lean();
    if (cat?.name) return cat.name;
  }
  return trimmed || 'Product';
}

/**
 * Get the next product code for a category (format: PREFIX-00001).
 * Uses a per-prefix sequence so codes are RING-00001, RING-00002, NECK-00001, etc.
 */
export async function getNextProductCode(categoryIdOrName: string): Promise<string> {
  await connectDB();
  const categoryName = await resolveCategoryName(categoryIdOrName);
  const prefix = categoryNameToPrefix(categoryName);

  const seq = await ProductCodeSequence.findOneAndUpdate(
    { categoryPrefix: prefix },
    { $inc: { lastNumber: 1 } },
    { new: true, upsert: true }
  );

  const number = seq?.lastNumber ?? 1;
  const padded = String(number).padStart(PAD_LENGTH, '0');
  return `${prefix}-${padded}`;
}
