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

    // Collect all attribute values
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([key, value]) => {
        if (!grouped.allAttributes[key]) {
          grouped.allAttributes[key] = new Set();
        }
        
        // Handle different value types
        if (Array.isArray(value)) {
          value.forEach((v) => grouped.allAttributes[key].add(v));
        } else if (value !== null && value !== undefined && value !== '') {
          // Handle comma-separated values (like colors)
          if (typeof value === 'string' && value.includes(',')) {
            value.split(',').forEach((v) => {
              const trimmed = v.trim();
              if (trimmed) grouped.allAttributes[key].add(trimmed);
            });
          } else {
            grouped.allAttributes[key].add(value);
          }
        }
      });
    }
  });

  return Array.from(groupedMap.values());
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

  // Normalize string values for comparison (case-insensitive, trimmed)
  const normalizeValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    return String(val).toLowerCase().trim();
  };

  return (
    variants.find((variant) => {
      return Object.entries(selectedAttributes).every(([key, value]) => {
        const variantValue = variant.attributes[key];
        const normalizedSelected = normalizeValue(value);
        
        if (variantValue === null || variantValue === undefined) {
          return false;
        }
        
        // Handle exact match (case-insensitive)
        if (normalizeValue(variantValue) === normalizedSelected) {
          return true;
        }
        
        // Handle array values
        if (Array.isArray(variantValue)) {
          return variantValue.some(v => normalizeValue(v) === normalizedSelected);
        }
        
        // Handle comma-separated strings (e.g., "Yellow, Green")
        if (typeof variantValue === 'string' && variantValue.includes(',')) {
          const values = variantValue.split(',').map(v => normalizeValue(v));
          return values.includes(normalizedSelected);
        }
        
        // Handle case-insensitive string comparison
        if (typeof variantValue === 'string' && typeof value === 'string') {
          return normalizeValue(variantValue) === normalizedSelected;
        }
        
        return false;
      });
    }) || null
  );
}

