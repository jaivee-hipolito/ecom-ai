'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductFilters as ProductFiltersType } from '@/types/product';
import Button from '@/components/ui/Button';

interface ProductFiltersProps {
  categories: Array<{ _id: string; name: string; slug?: string }>;
  onFilterChange: (filters: ProductFiltersType) => void;
  currentFilters: ProductFiltersType;
}

export default function ProductFilters({
  categories,
  onFilterChange,
  currentFilters,
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFiltersType>(currentFilters);
  const prevCurrentFiltersRef = useRef(currentFilters);

  // Sync internal state when currentFilters prop changes (e.g., from URL)
  useEffect(() => {
    // Only sync if currentFilters actually changed
    if (JSON.stringify(prevCurrentFiltersRef.current) !== JSON.stringify(currentFilters)) {
      setFilters(currentFilters);
      prevCurrentFiltersRef.current = currentFilters;
    }
  }, [currentFilters]);

  // Only call onFilterChange when user manually changes filters (not when syncing from props)
  const handleFilterUpdate = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    handleFilterUpdate({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handlePriceRangeChange = (
    type: 'minPrice' | 'maxPrice',
    value: string
  ) => {
    handleFilterUpdate({
      ...filters,
      [type]: value ? parseFloat(value) : undefined,
    });
  };

  const handleFeaturedToggle = () => {
    handleFilterUpdate({
      ...filters,
      featured: filters.featured ? undefined : true,
    });
  };

  const clearFilters = () => {
    handleFilterUpdate({});
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#050b2c]">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-[#ffa509] hover:text-[#ff8c00] transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-[#050b2c] mb-3 uppercase tracking-wide">
          Categories
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <label
              key={category._id}
              className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-[#ffa509]/10 transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.category === category.name}
                onChange={() => handleCategoryChange(category.name)}
                className="w-4 h-4 rounded border-gray-300 text-[#ffa509] focus:ring-[#ffa509] focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#050b2c] font-medium">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-[#050b2c] mb-3 uppercase tracking-wide">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min</label>
          <input
            type="number"
              placeholder="$0"
            value={filters.minPrice || ''}
            onChange={(e) => handlePriceRangeChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-all"
          />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max</label>
          <input
            type="number"
              placeholder="$1000"
            value={filters.maxPrice || ''}
            onChange={(e) => handlePriceRangeChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-all"
          />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div className="mb-4">
        <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-[#ffa509]/10 transition-colors">
          <input
            type="checkbox"
            checked={filters.featured === true}
            onChange={handleFeaturedToggle}
            className="w-4 h-4 rounded border-gray-300 text-[#ffa509] focus:ring-[#ffa509] focus:ring-2 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-[#050b2c] font-medium">
            Featured Only
          </span>
        </label>
      </div>
    </div>
  );
}
