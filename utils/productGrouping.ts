import { IProduct } from '@/types/product';

export interface ProductVariant {
  productId: string;
  attributes: Record<string, any>;
  stock: number;
  price: number;
  images: string[];
  coverImage?: string;
}

export interface GroupedProduct {
  name: string;
  description: string;
  basePrice: number; // Lowest price among variants
  variants: ProductVariant[];
  allAttributes: Record<string, Set<string | number | boolean>>; // All unique attribute values
  rating?: number;
  numReviews?: number;
  featured?: boolean;
}

/**
 * Groups products by name and collects all their attribute variations
 */
export function groupProductsByName(products: IProduct[]): GroupedProduct[] {
  const groupedMap = new Map<string, GroupedProduct>();

  products.forEach((product) => {
    const name = product.name.trim();
    
    if (!groupedMap.has(name)) {
      // Initialize grouped product
      const grouped: GroupedProduct = {
        name,
        description: product.description,
        basePrice: product.price,
        variants: [],
        allAttributes: {},
        rating: product.rating,
        numReviews: product.numReviews,
        featured: product.featured,
      };
      groupedMap.set(name, grouped);
    }

    const grouped = groupedMap.get(name)!;
    
    // Update base price if this variant is cheaper
    if (product.price < grouped.basePrice) {
      grouped.basePrice = product.price;
    }

    // Add variant
    const variant: ProductVariant = {
      productId: product._id!,
      attributes: product.attributes || {},
      stock: product.stock,
      price: product.price,
      images: product.images || [],
      coverImage: product.coverImage,
    };
    grouped.variants.push(variant);

    // Collect all attribute values (normalize keys so "Color" and "colour" merge).
    // Normalize string values so "Yellow Gold" and "Yellow gold" count as one (fixes duplicate color count).
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, value]) => {
        const nKey = normalizeAttrKey(key);
        if (!grouped.allAttributes[nKey]) {
          grouped.allAttributes[nKey] = new Set();
        }
        const addOne = (v: string | number | boolean) => {
          const normalized = typeof v === 'string' ? (v.trim().toLowerCase() || v) : v;
          grouped.allAttributes[nKey].add(normalized);
        };
        if (Array.isArray(value)) {
          value.forEach((v) => addOne(v as string | number | boolean));
        } else if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' && value.includes(',')) {
            // Don't split when comma is inside parentheses (e.g. "Tricolor(Yellow, White and Rose Gold)" = one option)
            const open = value.indexOf('(');
            const close = value.indexOf(')');
            const firstComma = value.indexOf(',');
            const commaInsideParens = open !== -1 && close !== -1 && firstComma > open && firstComma < close;
            if (commaInsideParens) {
              addOne(value);
            } else {
              value.split(',').forEach((v) => {
                const trimmed = v.trim();
                if (trimmed) addOne(trimmed);
              });
            }
          } else {
            addOne(value as string | number | boolean);
          }
        }
      });
    }
  });

  return Array.from(groupedMap.values());
}

/**
 * Normalize attribute key for flexible matching (e.g. "Size(inch)" and "size_inch" match).
 * "Color" and "colour" both normalize to "color" so variants show under one attribute.
 */
export function normalizeAttrKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/\bcolour\b/g, 'color')
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Strip to letters/numbers only for loose match (e.g. "Size(inch)" and "size_inch" -> "sizeinch") */
function normalizeAttrKeyStrict(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Normalize attribute value for deduplication (e.g. "Yellow Gold" and "Yellow gold" -> one entry) */
export function normalizeAttrValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value).trim().toLowerCase();
}

/**
 * Get attribute value from a record with flexible key matching
 */
export function getAttributeValue(attributes: Record<string, any>, key: string): any {
  if (attributes[key] !== undefined && attributes[key] !== null) {
    return attributes[key];
  }
  const nkey = normalizeAttrKey(key);
  let entry = Object.entries(attributes).find(
    ([k]) => normalizeAttrKey(k) === nkey
  );
  if (!entry) {
    const strictKey = normalizeAttrKeyStrict(key);
    entry = Object.entries(attributes).find(
      ([k]) => normalizeAttrKeyStrict(k) === strictKey
    );
  }
  return entry ? entry[1] : undefined;
}

function getVariantAttr(variant: ProductVariant, key: string): any {
  return getAttributeValue(variant.attributes, key);
}

/**
 * Finds a product variant matching the selected attributes
 */
export function findMatchingVariant(
  variants: ProductVariant[],
  selectedAttributes: Record<string, any>
): ProductVariant | null {
  if (Object.keys(selectedAttributes).length === 0) {
    return null;
  }

  const normalizeValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val).toLowerCase().trim();
  };

  return (
    variants.find((variant) => {
      return Object.entries(selectedAttributes).every(([key, value]) => {
        const variantValue = getVariantAttr(variant, key);
        const normalizedSelected = normalizeValue(value);

        if (variantValue === null || variantValue === undefined) {
          return false;
        }

        if (normalizeValue(variantValue) === normalizedSelected) {
          return true;
        }
        if (Array.isArray(variantValue)) {
          return variantValue.some((v) => normalizeValue(v) === normalizedSelected);
        }
        if (typeof variantValue === 'string' && variantValue.includes(',')) {
          const values = variantValue.split(',').map((v) => normalizeValue(v));
          return values.includes(normalizedSelected);
        }
        if (typeof variantValue === 'string' && typeof value === 'string') {
          return normalizeValue(variantValue) === normalizedSelected;
        }
        return false;
      });
    }) || null
  );
}

