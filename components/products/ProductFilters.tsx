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
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100/80">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-[#000000] tracking-tight">Refine by</h3>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-[#F9629F] hover:text-[#DB7093] transition-colors uppercase tracking-wide"
        >
          Clear all
        </button>
      </div>

      {/* Categories */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((category) => {
            const isChecked = filters.category === category.name;
            return (
              <label
                key={category._id}
                className={`flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-lg transition-colors ${
                  isChecked ? 'bg-[#FDE8F0]' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCategoryChange(category.name)}
                  className="w-4 h-4 rounded border-gray-300 text-[#F9629F] focus:ring-[#F9629F] focus:ring-2 cursor-pointer"
                />
                <span className={`text-sm font-medium ${isChecked ? 'text-[#000000]' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 mb-2.5 uppercase tracking-wider">
          Price range
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1 font-medium">Min ($)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceRangeChange('minPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9629F]/30 focus:border-[#F9629F] transition-all bg-gray-50/50"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1 font-medium">Max ($)</label>
            <input
              type="number"
              placeholder="999"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceRangeChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F9629F]/30 focus:border-[#F9629F] transition-all bg-gray-50/50"
            />
          </div>
        </div>
      </div>

      {/* Featured */}
      <div>
        <label
          className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors ${
            filters.featured ? 'bg-[#FDE8F0]' : 'hover:bg-gray-50'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.featured === true}
            onChange={handleFeaturedToggle}
            className="w-4 h-4 rounded border-gray-300 text-[#F9629F] focus:ring-[#F9629F] focus:ring-2 cursor-pointer"
          />
          <span className={`text-sm font-medium ${filters.featured ? 'text-[#000000]' : 'text-gray-600'}`}>
            Featured only
          </span>
        </label>
      </div>
    </div>
  );
}
