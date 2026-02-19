'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye, FiTrendingUp, FiFilter, FiRefreshCw, FiArrowLeft, FiAward, FiBarChart2 } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';

export default function MostViewedProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    minViews: 0,
    limit: 50,
  });

  useEffect(() => {
    fetchMostViewedProducts();
  }, [filter]);

  const fetchMostViewedProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: filter.limit.toString(),
        minViews: filter.minViews.toString(),
      });

      const response = await fetch(`/api/admin/products/most-viewed?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch most viewed products');
      }

      console.log('Most Viewed Products Response:', data);
      console.log('Products count:', data.products?.length || 0);
      
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load most viewed products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilter({
      minViews: 0,
      limit: 50,
    });
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-4 sm:p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
          <div className="relative z-10 flex items-center justify-center min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-transparent border-r-[#DB7093] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium">Loading most viewed products...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section — compact on mobile/tablet */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-purple-500/50 flex-shrink-0"
                >
                  <FiEye className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2">
                    Most Viewed Products
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-lg flex items-center gap-1.5 sm:gap-2">
                    <FiTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#F9629F] flex-shrink-0" />
                    Track and analyze your most popular products
                  </p>
                </div>
              </div>
              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 max-w-full"
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F9629F] rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-white/90 font-medium text-xs sm:text-sm">
                    {products.length} {products.length === 1 ? 'product' : 'products'} found
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back to Products
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

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

      {/* Filters — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
          <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F] flex-shrink-0" />
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Filter Options</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1 sm:mb-2">Minimum Views</label>
            <input
              type="number"
              min="0"
              value={filter.minViews}
              onChange={(e) => handleFilterChange('minViews', e.target.value)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] bg-white text-[#000000] transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1 sm:mb-2">Limit Results</label>
            <select
              value={filter.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] bg-white text-[#000000] transition-all"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all font-semibold flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
            >
              <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Products Table — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b-2 border-gray-200 bg-gradient-to-r from-[#000000] to-[#1a1a1a]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
                <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                Products ({products.length})
              </h3>
            </div>
          </div>

        {products.length === 0 ? (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-3 sm:p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-2 sm:mb-4"
            >
              <FiEye className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
            </motion.div>
            <p className="text-gray-600 mb-2 sm:mb-4 font-medium text-sm sm:text-base">No products found matching your criteria</p>
            <Link href="/admin/products/create">
              <Button 
                variant="primary" 
                size="sm"
                className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white border-none hover:from-[#DB7093] hover:to-[#F9629F] shadow-lg"
              >
                Create First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider hidden lg:table-cell">
                    Category
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-left text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-right text-[10px] sm:text-xs font-bold text-[#000000] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          index === 0 ? 'text-[#F9629F]' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md"
                          >
                            <FiAward className="w-3 h-3 inline mr-1" />
                            Top
                          </motion.span>
                        )}
                        {index === 1 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                            2nd
                          </span>
                        )}
                        {index === 2 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-200 text-orange-700">
                            3rd
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {product.coverImage || (product.images && product.images.length > 0) ? (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={product.coverImage || product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-cover rounded-lg flex-shrink-0 border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 border-2 border-gray-200"></div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-[#000000] truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-[10px] sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-xs hidden sm:block">
                            {product.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-bold text-[#000000]">
                        {formatCurrency(product.price || 0)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-lg ${
                          (product.stock || 0) > 0
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
                          <FiEye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#000000] tabular-nums">
                          {product.views || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-end gap-1 sm:space-x-2">
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all"
                          >
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </motion.div>
    </div>
  );
}

