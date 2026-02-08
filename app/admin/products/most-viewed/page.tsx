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
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
          <div className="relative z-10 flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#ff8c00] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-white/80 text-lg font-medium">Loading most viewed products...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/50"
                >
                  <FiEye className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Most Viewed Products
                  </h1>
                  <p className="text-white/80 text-lg flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-[#ffa509]" />
                    Track and analyze your most popular products
                  </p>
                </div>
              </div>
              
              {/* Stats Badge */}
              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="w-2 h-2 bg-[#ffa509] rounded-full animate-pulse"></div>
                  <span className="text-white/90 font-medium">
                    {products.length} {products.length === 1 ? 'product' : 'products'} found
                  </span>
                </motion.div>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <FiArrowLeft className="w-5 h-5" />
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiFilter className="w-5 h-5 text-[#ffa509]" />
          <h2 className="text-xl font-bold text-[#050b2c]">Filter Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#050b2c] mb-2">
              Minimum Views
            </label>
            <input
              type="number"
              min="0"
              value={filter.minViews}
              onChange={(e) => handleFilterChange('minViews', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] bg-white text-[#050b2c] transition-all"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#050b2c] mb-2">
              Limit Results
            </label>
            <select
              value={filter.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] bg-white text-[#050b2c] transition-all"
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
              className="w-full border-2 border-gray-300 text-[#050b2c] hover:border-[#ffa509] transition-all font-semibold flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-[#050b2c] to-[#0a1a4a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <FiBarChart2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Products ({products.length})
              </h3>
            </div>
          </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4"
            >
              <FiEye className="w-12 h-12 text-gray-400" />
            </motion.div>
            <p className="text-gray-600 mb-4 font-medium">No products found matching your criteria</p>
            <Link href="/admin/products/create">
              <Button 
                variant="primary" 
                size="sm"
                className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white border-none hover:from-[#ff8c00] hover:to-[#ffa509] shadow-lg"
              >
                Create First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#050b2c] uppercase tracking-wider">
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
                          index === 0 ? 'text-[#ffa509]' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-500' : 'text-gray-500'
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.coverImage || (product.images && product.images.length > 0) ? (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={product.coverImage || product.images[0]}
                            alt={product.name}
                            className="h-14 w-14 object-cover rounded-lg mr-4 border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mr-4 border-2 border-gray-200"></div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#050b2c]">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#050b2c]">
                        {formatCurrency(product.price || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                          (product.stock || 0) > 0
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <FiEye className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-[#050b2c]">
                          {product.views || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-2 border-gray-300 text-[#050b2c] hover:border-[#ffa509] transition-all"
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

