'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiStar,
  FiRefreshCw,
  FiMaximize2,
  FiZap
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Product, ProductListResponse } from '@/types/product';
import { Category } from '@/types/category';
import { formatCurrency } from '@/utils/currency';

interface ProductTableProps {
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  initialFilters?: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    minStock?: string;
    maxStock?: string;
    stockStatus?: string;
    featured?: string;
    isFlashSale?: string;
  };
  hideFilters?: boolean;
  preserveFiltersOnReset?: boolean;
  hiddenFilters?: string[];
  /** When true, the filters panel is collapsed/hidden by default (e.g. on main admin products page). */
  filtersDefaultHidden?: boolean;
}

export default function ProductTable({ 
  onEdit, 
  onDelete, 
  initialFilters,
  hideFilters = false,
  preserveFiltersOnReset = false,
  hiddenFilters = [],
  filtersDefaultHidden = false,
}: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [showFilters, setShowFilters] = useState(!filtersDefaultHidden);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [imageGallery, setImageGallery] = useState<{
    isOpen: boolean;
    product: Product | null;
    currentIndex: number;
  }>({
    isOpen: false,
    product: null,
    currentIndex: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: initialFilters?.search || '',
    category: initialFilters?.category || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    minStock: initialFilters?.minStock || '',
    maxStock: initialFilters?.maxStock || '',
    stockStatus: initialFilters?.stockStatus || '',
    featured: initialFilters?.featured || '',
    isFlashSale: '',
  });

  // Separate state for search input (for immediate UI updates)
  const [searchInput, setSearchInput] = useState(initialFilters?.search || '');

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, filters]);

  // Sync searchInput with filters.search when filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minStock) params.append('minStock', filters.minStock);
      if (filters.maxStock) params.append('maxStock', filters.maxStock);
      if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
      if (filters.featured) params.append('featured', filters.featured);
      if (filters.isFlashSale) params.append('isFlashSale', filters.isFlashSale);

      const response = await fetch(`/api/admin/products?${params}`);
      const data: ProductListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return;

    setDeleting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      setSuccessMessage(`Product "${deleteModal.productName}" deleted successfully`);
      setDeleteModal({ isOpen: false, productId: null, productName: '' });

      if (onDelete) {
        onDelete(deleteModal.productId);
      } else {
        await fetchProducts();
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    // Update input immediately for responsive UI
    setSearchInput(value);
    
    // Clear existing debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Set new debounce timer
    searchDebounceRef.current = setTimeout(() => {
      handleFilterChange('search', value);
    }, 500); // Wait 500ms after user stops typing
  };

  const handleResetFilters = () => {
    if (preserveFiltersOnReset && initialFilters) {
      setFilters({
        search: initialFilters.search || '',
        category: initialFilters.category || '',
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        minStock: initialFilters.minStock || '',
        maxStock: initialFilters.maxStock || '',
        stockStatus: initialFilters.stockStatus || '',
        featured: initialFilters.featured || '',
        isFlashSale: '',
      });
    } else {
      setFilters({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: '',
        stockStatus: '',
        featured: '',
        isFlashSale: '',
      });
    }
    setPage(1);
    setFilterKey((prev) => prev + 1);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(
      (cat) => cat._id === categoryId || cat.name === categoryId
    );
    return category?.name || categoryId;
  };

  // Calculate flash sale data for a product
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: Product) => {
    if (!product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
        discountPercentage: 0,
        displayedPrice: product.price,
        crossedOutPrice: product.price,
        hasDiscount: false,
      };
    }

    const discount = product.flashSaleDiscount;
    const discountType = product.flashSaleDiscountType || 'percentage';
    
    let displayedPrice: number;
    let crossedOutPrice: number;
    let discountPercentage: number;

    // Displayed price is always the product.price
    displayedPrice = product.price;

    if (discountType === 'percentage') {
      // Crossed out price = price * (percentage/100) + price
      crossedOutPrice = displayedPrice * (discount / 100) + displayedPrice;
      discountPercentage = discount;
    } else {
      // Fixed amount: crossed out price = price + discount
      crossedOutPrice = displayedPrice + discount;
      discountPercentage = (discount / displayedPrice) * 100;
    }

    return {
      discountPercentage: Math.round(discountPercentage),
      displayedPrice,
      crossedOutPrice,
      hasDiscount: true,
    };
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12 md:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-[#F9629F] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full">
      {/* Filters Section */}
      {!hideFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Filters</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600">{activeFiltersCount} active</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {activeFiltersCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Reset
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] rounded-lg hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold cursor-pointer"
              >
                {showFilters ? <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {showFilters ? 'Hide' : 'Show'}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-[#F9629F]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    />
                  </div>

                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat._id || cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#F9629F]" />
                    </div>
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <FiDollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#F9629F]" />
                    </div>
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    />
                  </div>

                  {!hiddenFilters.includes('minStock') && (
                    <input
                      type="number"
                      placeholder="Min available"
                      min="0"
                      value={filters.minStock || ''}
                      onChange={(e) => handleFilterChange('minStock', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    />
                  )}

                  {!hiddenFilters.includes('maxStock') && (
                    <input
                      type="number"
                      placeholder="Max available"
                      min="0"
                      value={filters.maxStock || ''}
                      onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    />
                  )}

                  {!hiddenFilters.includes('stockStatus') && (
                    <select
                      value={filters.stockStatus}
                      onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                    >
                      <option value="">All Stock Status</option>
                      <option value="in-stock">In stock (available &gt; 0)</option>
                      <option value="out-of-stock">Out of stock (0 available)</option>
                      <option value="low-stock">Low stock (&lt; 10 available)</option>
                    </select>
                  )}

                  <select
                    value={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                  >
                    <option value="">All Products</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Not Featured</option>
                  </select>

                  <select
                    value={filters.isFlashSale}
                    onChange={(e) => handleFilterChange('isFlashSale', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all"
                  >
                    <option value="">All Products</option>
                    <option value="true">Flash Sale</option>
                    <option value="false">Not Flash Sale</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Alert variant="error" onClose={() => setError('')} className="bg-red-500/20 border-red-500/50 text-red-800">
              {error}
            </Alert>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Alert variant="success" onClose={() => setSuccessMessage('')} className="bg-green-500/20 border-green-500/50 text-green-800">
              {successMessage}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">
                Products
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {total} {total === 1 ? 'product' : 'products'} found
              </p>
            </div>
          </div>
          <Link href="/admin/products/create" className="cursor-pointer flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-[#ffa509] to-[#F9629F] text-[#000000] font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Add Product
            </motion.button>
          </Link>
        </div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 sm:py-14 md:py-16"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FiPackage className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-2">Try adjusting your filters or add a new product</p>
            <Link href="/admin/products/create" className="cursor-pointer">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] font-bold rounded-lg sm:rounded-xl hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer"
              >
                Add Your First Product
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-5 md:mb-6">
              {products.map((product, index) => {
                const flashSaleData = calculateFlashSaleData(product);
                const { discountPercentage, displayedPrice, crossedOutPrice, hasDiscount } = flashSaleData;

                return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-gray-100 overflow-hidden hover:border-[#F9629F]/50 transition-all group"
                >
                  {/* Product Image */}
                  <div 
                    className="relative h-36 sm:h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer group/image"
                    onClick={() => {
                      const productImages = product.images && product.images.length > 0 
                        ? product.images 
                        : product.coverImage 
                        ? [product.coverImage] 
                        : [];
                      if (productImages.length > 0) {
                        setImageGallery({
                          isOpen: true,
                          product,
                          currentIndex: 0,
                        });
                      }
                    }}
                  >
                    {product.coverImage || (product.images && product.images.length > 0) ? (
                      <>
                        <Image
                          src={product.coverImage || product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* View Images Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg flex items-center gap-2"
                          >
                            <FiMaximize2 className="w-5 h-5 text-[#000000]" />
                            <span className="text-sm font-semibold text-[#000000]">
                              {product.images && product.images.length > 0 
                                ? `${product.images.length} Image${product.images.length > 1 ? 's' : ''}`
                                : 'View Image'}
                            </span>
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Flash Sale Badge - Top Left */}
                    {product.isFlashSale && hasDiscount && (
                      <div className="absolute top-2 left-2 z-30">
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                          className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <FiZap className="w-3 h-3" />
                          </motion.div>
                          <span className="text-[10px] font-black tracking-wide">FLASH</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Discount Badge - Top Right */}
                    {product.isFlashSale && hasDiscount && (
                      <div className="absolute top-2 right-2 z-30">
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="bg-gradient-to-br from-[#F9629F] via-[#FC9BC2] to-[#DB7093] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl border-2 border-white"
                        >
                          <div className="text-center">
                            <div className="text-[10px] font-black leading-tight">-{discountPercentage}%</div>
                            <div className="text-[6px] font-bold">OFF</div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {product.featured && (
                      <div className={`absolute ${product.isFlashSale && hasDiscount ? 'top-14' : 'top-3'} right-3 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10`}>
                        <FiStar className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 md:p-5">
                    <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#000000] mb-1.5 sm:mb-2 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#F9629F]/10 text-[#F9629F] rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold">
                          {getCategoryName(product.category)}
                        </span>
                        {product.productCode && (
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 rounded-md sm:rounded-lg text-xs font-mono font-medium">
                            {product.productCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5 sm:gap-2">
                        {product.isFlashSale && hasDiscount ? (
                          <>
                            <span className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent tabular-nums">
                              {formatCurrency(displayedPrice)}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400 line-through tabular-nums">
                              {formatCurrency(crossedOutPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg md:text-2xl font-bold text-[#000000] tabular-nums">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Info: show available to customers when API provides it */}
                    {(() => {
                      const available = product.availableStock ?? product.stock;
                      return (
                        <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${available > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-xs sm:text-sm font-medium ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {available > 0 ? `${available} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex gap-1.5 sm:gap-2">
                      <Link href={`/admin/products/${product._id}`} className="flex-1 min-w-0 cursor-pointer">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          View
                        </motion.button>
                      </Link>
                      <Link href={`/admin/products/${product._id}/edit`} className="flex-1 min-w-0 cursor-pointer">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold cursor-pointer"
                        >
                          <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          Edit
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteClick(product._id!, product.name)}
                        className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center text-xs sm:text-sm font-medium cursor-pointer flex-shrink-0"
                      >
                        <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200"
              >
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing <span className="font-semibold text-[#000000] tabular-nums">{(page - 1) * limit + 1}</span>–<span className="font-semibold text-[#000000] tabular-nums">{Math.min(page * limit, total)}</span> of <span className="font-semibold text-[#000000] tabular-nums">{total}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Prev
                  </motion.button>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] rounded-lg font-bold text-xs sm:text-sm tabular-nums">
                    {page} / {totalPages}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    Next
                    <FiChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? All associated images will also be deleted."
        itemName={deleteModal.productName}
        isLoading={deleting}
      />

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {imageGallery.isOpen && imageGallery.product && (() => {
          const productImages = imageGallery.product.images && imageGallery.product.images.length > 0 
            ? imageGallery.product.images 
            : imageGallery.product.coverImage 
            ? [imageGallery.product.coverImage] 
            : [];
          
          if (productImages.length === 0) return null;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setImageGallery({ isOpen: false, product: null, currentIndex: 0 })}
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageGallery({ isOpen: false, product: null, currentIndex: 0 });
                }}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300"
                aria-label="Close gallery"
              >
                <FiX className="w-6 h-6" />
              </motion.button>

              {/* Previous Button */}
              {productImages.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageGallery(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : productImages.length - 1,
                    }));
                  }}
                  className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-300"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </motion.button>
              )}

              {/* Next Button */}
              {productImages.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageGallery(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex < productImages.length - 1 ? prev.currentIndex + 1 : 0,
                    }));
                  }}
                  className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-300"
                  aria-label="Next image"
                >
                  <FiChevronRight className="w-6 h-6" />
                </motion.button>
              )}

              {/* Image Container */}
              <motion.div
                key={imageGallery.currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {productImages[imageGallery.currentIndex] ? (
                  <Image
                    src={productImages[imageGallery.currentIndex]}
                    alt={`${imageGallery.product.name} - Image ${imageGallery.currentIndex + 1}`}
                    width={1200}
                    height={1200}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    priority
                  />
                ) : (
                  <div className="w-full h-[60vh] flex items-center justify-center bg-gray-800 rounded-lg">
                    <FiPackage className="w-24 h-24 text-gray-400" />
                  </div>
                )}

                {/* Image Counter */}
                {productImages.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {imageGallery.currentIndex + 1} / {productImages.length}
                  </motion.div>
                )}

              </motion.div>

              {/* Thumbnail Navigation */}
              {productImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-white/10 backdrop-blur-md rounded-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {productImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setImageGallery(prev => ({ ...prev, currentIndex: idx }))}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === imageGallery.currentIndex
                          ? 'border-[#F9629F] ring-2 ring-[#F9629F]/50'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
