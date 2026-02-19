'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiFilter, FiRefreshCw, FiCheckSquare, FiSquare, FiTrash2, FiSave, FiX, FiEdit } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import BulkUpdateConfirmationModal from './BulkUpdateConfirmationModal';
import BulkDeleteConfirmationModal from './BulkDeleteConfirmationModal';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

export default function BulkOperations() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter input values (immediate updates for UI)
  const [filterInputs, setFilterInputs] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    stockStatus: '',
    featured: '',
  });

  // Debounced filter values (used for API calls)
  const [debouncedFilters, setDebouncedFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    stockStatus: '',
    featured: '',
  });

  // Filters (synced with debouncedFilters)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    stockStatus: '',
    featured: '',
  });

  const [updates, setUpdates] = useState({
    price: '',
    category: '',
    stock: '',
    featured: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce all filter inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filterInputs);
    }, 500); // Wait 500ms after user stops typing/changing

    return () => clearTimeout(timer);
  }, [filterInputs]);

  // Update filters when debounced filters change
  useEffect(() => {
    setFilters(debouncedFilters);
  }, [debouncedFilters]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: '1000',
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minStock) params.append('minStock', filters.minStock);
      if (filters.maxStock) params.append('maxStock', filters.maxStock);
      if (filters.stockStatus) params.append('stockStatus', filters.stockStatus);
      if (filters.featured) params.append('featured', filters.featured);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p._id!)));
    }
  };

  const handleUpdateChange = (name: string, value: string) => {
    setUpdates({
      ...updates,
      [name]: value,
    });
  };

  const handleFilterChange = (name: string, value: string) => {
    // Update input value immediately (debounced filters will update later)
    setFilterInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear selection when filters change
    setSelectedProducts(new Set());
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      stockStatus: '',
      featured: '',
    };
    setFilterInputs(emptyFilters);
    setDebouncedFilters(emptyFilters);
    setFilters(emptyFilters);
    setFilterKey((prev) => prev + 1);
    setSelectedProducts(new Set());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (selectedProducts.size === 0) {
      setError('Please select at least one product');
      return;
    }

    // Build updates object (only include fields that have values)
    const updateData: any = {};
    if (updates.price && updates.price.trim() !== '') {
      updateData.price = updates.price;
    }
    if (updates.category && updates.category.trim() !== '') {
      updateData.category = updates.category;
    }
    if (updates.stock && updates.stock.trim() !== '') {
      updateData.stock = updates.stock;
    }
    if (updates.featured && updates.featured.trim() !== '') {
      updateData.featured = updates.featured === 'true';
    }

    if (Object.keys(updateData).length === 0) {
      setError('Please provide at least one field to update');
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowConfirmModal(false);
    setUpdating(true);
    setError('');
    setSuccessMessage('');

    // Build updates object (only include fields that have values)
    const updateData: any = {};
    if (updates.price && updates.price.trim() !== '') {
      updateData.price = updates.price;
    }
    if (updates.category && updates.category.trim() !== '') {
      updateData.category = updates.category;
    }
    if (updates.stock && updates.stock.trim() !== '') {
      updateData.stock = updates.stock;
    }
    if (updates.featured && updates.featured.trim() !== '') {
      updateData.featured = updates.featured === 'true';
    }

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          updates: updateData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update products');
      }

      setSuccessMessage(
        `Successfully updated ${data.modifiedCount} product(s)`
      );
      
      // Reset form
      setUpdates({
        price: '',
        category: '',
        stock: '',
        featured: '',
      });
      setSelectedProducts(new Set());

      // Refresh products list
      await fetchProducts();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update products');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    if (selectedProducts.size === 0) {
      setError('Please select at least one product to delete');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete products');
      }

      setSuccessMessage(
        `Successfully deleted ${data.deletedCount} product(s)`
      );
      
      // Clear selection
      setSelectedProducts(new Set());

      // Refresh products list
      await fetchProducts();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete products');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#DB7093] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-[#000000] font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            </motion.div>
          )}

          {/* Filters — hidden by default */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 border-gray-200 mb-3 sm:mb-4 md:mb-6"
            key={filterKey}
          >
            <div className="flex flex-wrap justify-between items-center gap-2 mb-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg">
                  <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-[#000000]">Filters</h3>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white border-none hover:opacity-90 font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  {showFilters ? <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {showFilters ? 'Hide' : 'Show'}
                </Button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-5 md:pt-6">
              <Input
                label="Search"
                type="text"
                placeholder="Search products..."
                value={filterInputs.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Select
                label="Category"
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((cat) => ({
                    value: cat._id || cat.name,
                    label: cat.name,
                  })),
                ]}
                value={filterInputs.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Input
                label="Min Price"
                type="number"
                placeholder="0"
                value={filterInputs.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Input
                label="Max Price"
                type="number"
                placeholder="1000"
                value={filterInputs.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Input
                label="Min Stock"
                type="number"
                placeholder="0"
                min="0"
                value={filterInputs.minStock || ''}
                onChange={(e) => handleFilterChange('minStock', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Input
                label="Max Stock"
                type="number"
                placeholder="1000"
                min="0"
                value={filterInputs.maxStock || ''}
                onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Select
                label="Stock Status"
                options={[
                  { value: '', label: 'All' },
                  { value: 'in-stock', label: 'In Stock' },
                  { value: 'out-of-stock', label: 'Out of Stock' },
                  { value: 'low-stock', label: 'Low Stock (< 10)' },
                ]}
                value={filterInputs.stockStatus}
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />

              <Select
                label="Featured"
                options={[
                  { value: '', label: 'All' },
                  { value: 'true', label: 'Featured' },
                  { value: 'false', label: 'Not Featured' },
                ]}
                value={filterInputs.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
              />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Update Fields */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border-t-2 border-gray-200 pt-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <FiEdit className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#000000]">
                  Update Fields
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  placeholder="Enter new price"
                  min="0"
                  step="0.01"
                  value={updates.price}
                  onChange={(e) => handleUpdateChange('price', e.target.value)}
                  className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
                />

                <Select
                  label="Category"
                  options={[
                    { value: '', label: 'Select category (optional)' },
                    ...categories.map((cat) => ({
                      value: cat._id || cat.name,
                      label: cat.name,
                    })),
                  ]}
                  value={updates.category}
                  onChange={(e) => handleUpdateChange('category', e.target.value)}
                  className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
                />

                <Input
                  label="Stock Level"
                  type="number"
                  placeholder="Enter new stock level"
                  min="0"
                  value={updates.stock}
                  onChange={(e) => handleUpdateChange('stock', e.target.value)}
                  className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
                />

                <Select
                  label="Featured"
                  options={[
                    { value: '', label: 'No change' },
                    { value: 'true', label: 'Featured' },
                    { value: 'false', label: 'Not Featured' },
                  ]}
                  value={updates.featured}
                  onChange={(e) => handleUpdateChange('featured', e.target.value)}
                  className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
                />
              </div>
            </motion.div>

            {/* Product Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t-2 border-gray-200 pt-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg">
                    {selectedProducts.size > 0 ? (
                      <FiCheckSquare className="w-5 h-5 text-white" />
                    ) : (
                      <FiSquare className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#000000]">
                    Select Products{' '}
                    <span className="text-[#F9629F]">({selectedProducts.size} selected)</span>
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all font-semibold flex items-center gap-2"
                >
                  {selectedProducts.size === products.length ? (
                    <>
                      <FiSquare className="w-4 h-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <FiCheckSquare className="w-4 h-4" />
                      Select All
                    </>
                  )}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#000000] uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.size === products.length &&
                            products.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-2 border-gray-300 text-[#F9629F] focus:ring-[#F9629F] w-5 h-5 cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#000000] uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#000000] uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#000000] uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#000000] uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                              <FiSquare className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No products found</p>
                            <p className="text-sm text-gray-500">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`transition-colors ${
                            selectedProducts.has(product._id!)
                              ? 'bg-gradient-to-r from-[#F9629F]/10 to-[#DB7093]/10 border-l-4 border-[#F9629F]'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product._id!)}
                              onChange={() => handleSelectProduct(product._id!)}
                              className="rounded border-2 border-gray-300 text-[#F9629F] focus:ring-[#F9629F] w-5 h-5 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {product.coverImage ||
                              (product.images && product.images.length > 0) ? (
                                <motion.img
                                  whileHover={{ scale: 1.1 }}
                                  src={product.coverImage || product.images[0]}
                                  alt={product.name}
                                  className="h-12 w-12 object-cover rounded-lg mr-3 border-2 border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mr-3 border-2 border-gray-200"></div>
                              )}
                              <div>
                                <div className="text-sm font-semibold text-[#000000]">
                                  {product.name}
                                </div>
                                {product.featured && (
                                  <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-bold rounded-lg bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#000000]">
                            ${product.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                              (product.stock || 0) > 0
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {product.stock || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                              {(() => {
                                const category = categories.find(
                                  (cat) =>
                                    cat._id === product.category ||
                                    cat.name === product.category
                                );
                                return category?.name || product.category || 'N/A';
                              })()}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t-2 border-gray-200"
            >
              <div>
                {selectedProducts.size > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteClick}
                    disabled={deleting || updating}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white border-none hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete {selectedProducts.size} Product(s)
                  </Button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={deleting || updating}
                  className="border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updating}
                  disabled={selectedProducts.size === 0 || deleting}
                  className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white border-none hover:from-[#DB7093] hover:to-[#F9629F] shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Update {selectedProducts.size} Product(s)
                </Button>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Bulk Update Confirmation Modal */}
      <BulkUpdateConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        selectedCount={selectedProducts.size}
        updates={updates}
        categoryName={
          updates.category
            ? categories.find(
                (cat) =>
                  cat._id === updates.category || cat.name === updates.category
              )?.name
            : undefined
        }
        isLoading={updating}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedProducts.size}
        isLoading={deleting}
      />
    </div>
  );
}

