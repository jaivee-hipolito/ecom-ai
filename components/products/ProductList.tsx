'use client';

import { IProduct } from '@/types/product';
import ProductCard from './ProductCard';
import GroupedProductCard from './GroupedProductCard';
import Loading from '@/components/ui/Loading';
import { groupProductsByName } from '@/utils/productGrouping';
import { useMemo } from 'react';

interface ProductListProps {
  products: IProduct[];
  isLoading?: boolean;
  groupByName?: boolean; // New prop to enable grouping
  showAttributes?: boolean | 'color-only'; // true = all, false = none, 'color-only' = only color attr
}

export default function ProductList({
  products,
  isLoading = false,
  groupByName = true,
  showAttributes = true,
}: ProductListProps) {
  // Group products by name if enabled
  const groupedProducts = useMemo(() => {
    if (!groupByName) return null;
    return groupProductsByName(products);
  }, [products, groupByName]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md animate-pulse"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No products found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  // If grouping is enabled and we have grouped products, show grouped view
  if (groupByName && groupedProducts && groupedProducts.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {groupedProducts.map((groupedProduct) => (
          <GroupedProductCard
            key={groupedProduct.name}
            groupedProduct={groupedProduct}
            showAttributes={showAttributes}
          />
        ))}
      </div>
    );
  }

  // Otherwise, show individual products
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} showAttributes={showAttributes} />
      ))}
    </div>
  );
}
