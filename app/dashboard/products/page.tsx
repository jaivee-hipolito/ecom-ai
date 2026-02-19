'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch } from 'react-icons/fi';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { useProducts } from '@/hooks/useProducts';
import { ProductFilters as ProductFiltersType } from '@/types/product';
import Loading from '@/components/ui/Loading';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string; slug?: string }>
  >([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { products, isLoading, pagination } = useProducts({
    filters,
    page,
    limit: 12,
  });

  useEffect(() => {
    // Fetch categories
    fetch('/api/products/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [filters]);

  // Sync search query with filters
  useEffect(() => {
    if (filters.search !== undefined && filters.search !== searchQuery) {
      setSearchQuery(filters.search);
    } else if (filters.search === undefined && searchQuery) {
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  // Prevent body scroll when mobile filter modal is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  return (
    <div className="w-full max-w-7xl mx-auto px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-auto md:flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilters({ ...filters, search: e.target.value || undefined });
                }}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] transition-all shadow-sm hover:shadow-md text-gray-900 placeholder-gray-400 bg-white"
                style={{ color: '#111827' }}
              />
              <FiSearch className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm hover:shadow-md ${
              Object.keys(filters).length > 0
                ? 'bg-[#F9629F] text-white border border-gray-300 hover:bg-[#DB7093]'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
            {Object.keys(filters).length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                Object.keys(filters).length > 0
                  ? 'bg-white text-[#F9629F]'
                  : 'bg-[#F9629F] text-white'
              }`}>
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            {/* Filter Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-[#000000]">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close filters"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                {categories.length > 0 && (
                  <ProductFilters
                    categories={categories}
                    onFilterChange={(newFilters) => {
                      setFilters(newFilters);
                      // Don't auto-close - let user close manually to see results
                    }}
                    currentFilters={filters}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:sticky lg:top-8 lg:h-fit">
          {categories.length > 0 && (
            <ProductFilters
              categories={categories}
              onFilterChange={setFilters}
              currentFilters={filters}
            />
          )}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 w-full">
          {isLoading ? (
            <Loading size="lg" text="Loading products..." />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {products.length} of {pagination.total} products
              </div>
              <ProductList products={products} isLoading={isLoading} showAttributes="color-only" />
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

