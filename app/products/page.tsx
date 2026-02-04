'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ProductList from '@/components/products/ProductList';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import Loading from '@/components/ui/Loading';
import { useProducts } from '@/hooks/useProducts';
import { ProductFilters as ProductFiltersType } from '@/types/product';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isUpdatingFromUrl = useRef(false);
  const limit = 12;

  // Get category and search from URL query params
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('search');
  const minPriceFromUrl = searchParams.get('minPrice');
  const maxPriceFromUrl = searchParams.get('maxPrice');
  const featuredFromUrl = searchParams.get('featured');

  // Initialize filters from URL - sync with URL changes
  useEffect(() => {
    isUpdatingFromUrl.current = true;
    
    const initialFilters: ProductFiltersType = {};
    
    if (categoryFromUrl) {
      initialFilters.category = decodeURIComponent(categoryFromUrl);
    }
    if (searchFromUrl) {
      initialFilters.search = decodeURIComponent(searchFromUrl);
      setSearchQuery(decodeURIComponent(searchFromUrl));
    }
    if (minPriceFromUrl) {
      initialFilters.minPrice = parseFloat(minPriceFromUrl);
    }
    if (maxPriceFromUrl) {
      initialFilters.maxPrice = parseFloat(maxPriceFromUrl);
    }
    if (featuredFromUrl === 'true') {
      initialFilters.featured = true;
    }
    
    // Only update filters if they're different from current filters
    const filtersString = JSON.stringify(initialFilters);
    const currentFiltersString = JSON.stringify(filters);
    
    if (filtersString !== currentFiltersString) {
      setFilters(initialFilters);
    }
    
    // Reset flag after a short delay to allow state update
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 0);
  }, [categoryFromUrl, searchFromUrl, minPriceFromUrl, maxPriceFromUrl, featuredFromUrl]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Update URL when filters change (but only if changed by user, not from URL sync)
  useEffect(() => {
    // Don't update URL if we're currently syncing from URL
    if (isUpdatingFromUrl.current) return;

    const params = new URLSearchParams();
    if (filters.category) {
      params.set('category', filters.category);
    }
    if (filters.minPrice !== undefined) {
      params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters.featured) {
      params.set('featured', 'true');
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const queryString = params.toString();
    const newUrl = `/products${queryString ? `?${queryString}` : ''}`;
    
    // Build current URL from searchParams for comparison
    const currentParams = new URLSearchParams();
    if (categoryFromUrl) currentParams.set('category', categoryFromUrl);
    if (minPriceFromUrl) currentParams.set('minPrice', minPriceFromUrl);
    if (maxPriceFromUrl) currentParams.set('maxPrice', maxPriceFromUrl);
    if (featuredFromUrl === 'true') currentParams.set('featured', 'true');
    if (searchFromUrl) currentParams.set('search', searchFromUrl);
    if (currentPage > 1) currentParams.set('page', currentPage.toString());
    
    const currentUrl = `/products${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
    
    // Only update URL if it's different from current URL
    if (newUrl !== currentUrl) {
      router.replace(newUrl, {
        scroll: false,
      });
    }
  }, [filters, currentPage, router, categoryFromUrl, minPriceFromUrl, maxPriceFromUrl, featuredFromUrl, searchFromUrl]);

  // Fetch products with filters
  const { products, isLoading, error, pagination } = useProducts({
    filters,
    page: currentPage,
    limit,
    autoFetch: true,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.featured, filters.search]);

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#050b2c] via-[#0a1538] to-[#050b2c] text-white py-12 lg:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl lg:text-5xl font-bold mb-4"
            >
              Discover Our Products
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Explore our wide range of high-quality products
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:w-auto lg:flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFilters({ ...filters, search: e.target.value || undefined });
                  }}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-all shadow-sm hover:shadow-md text-[#050b2c] placeholder-gray-400"
                />
                <FiSearch className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-[#ffa509] text-white shadow-lg'
                      : 'text-gray-600 hover:text-[#ffa509]'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-[#ffa509] text-white shadow-lg'
                      : 'text-gray-600 hover:text-[#ffa509]'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg ${
                  showFilters
                    ? 'bg-[#ffa509] text-white'
                    : 'bg-white text-[#050b2c] hover:bg-[#ffa509] hover:text-white'
                }`}
              >
                <FiFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white text-[#ffa509] px-2 py-0.5 rounded-full text-xs font-bold">
                    {Object.keys(filters).length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {filters.category && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-[#ffa509] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Category: {filters.category}</span>
                  <button
                    onClick={() => setFilters({ ...filters, category: undefined })}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {filters.minPrice !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-[#ffa509] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Min: ${filters.minPrice}</span>
                  <button
                    onClick={() => setFilters({ ...filters, minPrice: undefined })}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {filters.maxPrice !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-[#ffa509] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Max: ${filters.maxPrice}</span>
                  <button
                    onClick={() => setFilters({ ...filters, maxPrice: undefined })}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {filters.featured && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-[#ffa509] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Featured</span>
                  <button
                    onClick={() => setFilters({ ...filters, featured: undefined })}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {filters.search && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-[#ffa509] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <span>Search: {filters.search}</span>
                  <button
                    onClick={() => {
                      setFilters({ ...filters, search: undefined });
                      setSearchQuery('');
                    }}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {hasActiveFilters && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: showFilters ? 1 : 0, x: showFilters ? 0 : -20 }}
            transition={{ duration: 0.3 }}
            className={`lg:w-64 flex-shrink-0 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </div>
          </motion.aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 flex items-center justify-between"
              >
                <p className="text-gray-600 font-medium">
                  Showing{' '}
                  <span className="text-[#050b2c] font-bold">
                    {products.length}
                  </span>{' '}
                  of{' '}
                  <span className="text-[#050b2c] font-bold">
                    {pagination.total}
                  </span>{' '}
                  products
                </p>
              </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loading size="lg" text="Loading products..." />
              </div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
              >
                <p className="text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Products List */}
            {!isLoading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ProductList
                  products={products}
                  isLoading={false}
                  groupByName={viewMode === 'grid'}
                />
              </motion.div>
            )}

            {/* Pagination */}
            {!isLoading && !error && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
              >
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && products.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white rounded-lg shadow-md"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-full flex items-center justify-center">
                    <FiSearch className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#050b2c] mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-[#ffa509] text-white rounded-lg font-semibold hover:bg-[#ff8c00] transition-colors shadow-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

