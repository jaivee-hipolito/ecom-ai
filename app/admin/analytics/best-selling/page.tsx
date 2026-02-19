'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Product {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  currentPrice: number;
  stock: number;
  image: string;
}

export default function BestSellingProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    limit: '50',
    minQuantity: '0',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: filters.limit,
        minQuantity: filters.minQuantity,
      });
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/analytics/best-selling?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch best selling products');
      }

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load best selling products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchProducts();
  };

  const handleResetFilters = () => {
    setFilters({
      limit: '50',
      minQuantity: '0',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchProducts(), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return {
        bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500',
        text: 'text-white',
        icon: FiAward,
        label: '🏆 #1',
      };
    } else if (index === 1) {
      return {
        bg: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
        text: 'text-white',
        icon: FiAward,
        label: '#2',
      };
    } else if (index === 2) {
      return {
        bg: 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500',
        text: 'text-white',
        icon: FiAward,
        label: '#3',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-[#000000] to-[#1a1a1a]',
      text: 'text-white',
      icon: null,
      label: `#${index + 1}`,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="relative">
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-transparent border-r-[#000000] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-2 sm:mt-4 text-[#000000] font-semibold text-sm sm:text-base md:text-lg">Loading best selling products...</p>
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
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                >
                  <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <span>Best Selling Products</span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-lg">
                Products ranked by quantity sold • {products.length} products
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70">Total Revenue</p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold truncate tabular-nums">
                      {formatCurrency(products.reduce((sum, p) => sum + p.totalRevenue, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters Section — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
              <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Filter Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiBarChart2 className="w-4 h-4 text-[#F9629F]" />
                Limit
              </label>
              <Input
                type="number"
                placeholder="50"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-[#F9629F]" />
                Min Quantity
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minQuantity}
                onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-[#F9629F]" />
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-[#F9629F]" />
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20"
              />
            </motion.div>
            <div className="flex items-end gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] hover:from-[#DB7093] hover:to-[#F9629F] border-0 text-white font-semibold shadow-lg w-full"
                >
                  <FiSearch className="w-4 h-4 mr-2 inline" />
                  Apply
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="border border-gray-300 text-[#000000] hover:bg-[#000000] hover:text-white font-semibold w-full"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2 inline" />
                  Reset
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3"
        >
          <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p className="font-semibold">{error}</p>
        </motion.div>
      )}

      {/* Products Grid — compact on mobile */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
          {products.map((product, index) => {
            const rankBadge = getRankBadge(index);
            return (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-gray-200 hover:border-[#F9629F] transition-all overflow-hidden group"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 md:gap-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${rankBadge.bg} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ${rankBadge.text} font-bold text-sm sm:text-base md:text-lg`}
                      >
                        {rankBadge.icon ? (
                          <rankBadge.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                        ) : (
                          <span>{rankBadge.label}</span>
                        )}
                      </motion.div>
                    </div>

                    {/* Product Image & Info */}
                    <div className="flex-1 flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      {product.image && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0"
                        >
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-cover rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200"
                          />
                        </motion.div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#000000] mb-0.5 sm:mb-1 group-hover:text-[#F9629F] transition-colors line-clamp-2">
                          {product.productName}
                        </h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold">
                            <FiTag className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-none">{product.category}</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold tabular-nums">
                            <FiDollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                            {formatCurrency(product.currentPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 flex-1">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-green-200"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          <p className="text-[10px] sm:text-xs font-semibold text-green-700 truncate">Qty Sold</p>
                        </div>
                        <p className="text-sm sm:text-base md:text-xl font-bold text-[#000000] tabular-nums">
                          {product.totalQuantity.toLocaleString()}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-[#F9629F]/10 to-[#DB7093]/10 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-[#F9629F]/30"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-[#F9629F] flex-shrink-0" />
                          <p className="text-[10px] sm:text-xs font-semibold text-[#F9629F] truncate">Revenue</p>
                        </div>
                        <p className="text-sm sm:text-base md:text-xl font-bold text-[#000000] tabular-nums truncate">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                          <p className="text-[10px] sm:text-xs font-semibold text-blue-700 truncate">Orders</p>
                        </div>
                        <p className="text-sm sm:text-base md:text-xl font-bold text-[#000000] tabular-nums">
                          {product.orderCount}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 ${
                          product.stock === 0
                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                            : product.stock < 10
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          {product.stock === 0 ? (
                            <FiXCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                          ) : product.stock < 10 ? (
                            <FiAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                          ) : (
                            <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          )}
                          <p
                            className={`text-[10px] sm:text-xs font-semibold truncate ${
                              product.stock === 0
                                ? 'text-red-700'
                                : product.stock < 10
                                ? 'text-yellow-700'
                                : 'text-green-700'
                            }`}
                          >
                            Stock
                          </p>
                        </div>
                        <p
                          className={`text-sm sm:text-base md:text-xl font-bold tabular-nums ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock < 10
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-xl border-2 border-gray-200 p-6 sm:p-8 md:p-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 sm:mb-4 md:mb-6"
          >
            <FiBarChart2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400" />
          </motion.div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#000000] mb-1 sm:mb-2">No Sales Data Available</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
            Orders need to be created first to track sales.
          </p>
          <Link href="/admin/orders">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] hover:from-[#DB7093] hover:to-[#F9629F] border-0 text-white font-semibold shadow-lg"
              >
                View Orders
                <FiChevronRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

