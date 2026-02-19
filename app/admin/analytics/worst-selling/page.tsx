'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiTrendingDown,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiCalendar,
  FiBarChart2,
  FiAlertTriangle,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTarget,
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

export default function WorstSellingProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    limit: '50',
    maxQuantity: '10',
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
        maxQuantity: filters.maxQuantity,
      });
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/analytics/worst-selling?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch worst selling products');
      }

      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load worst selling products');
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
      maxQuantity: '10',
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

  const getRankBadge = (index: number, quantity: number) => {
    if (quantity === 0) {
      return {
        bg: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
        text: 'text-white',
        icon: FiXCircle,
        label: '⚠️',
        subLabel: 'Zero Sales',
      };
    } else if (quantity <= 2) {
      return {
        bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500',
        text: 'text-white',
        icon: FiAlertTriangle,
        label: '🔴',
        subLabel: 'Critical',
      };
    } else if (quantity <= 5) {
      return {
        bg: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-500',
        text: 'text-white',
        icon: FiAlertCircle,
        label: '🟡',
        subLabel: 'Low',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
      text: 'text-white',
      icon: null,
      label: `#${index + 1}`,
      subLabel: 'Poor',
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
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-transparent border-r-[#000000] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-2 sm:mt-4 text-[#000000] font-semibold text-sm sm:text-base md:text-lg">Loading worst selling products...</p>
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
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-red-600 p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.25),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: -360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border-2 border-white/30 flex-shrink-0"
                >
                  <FiTrendingDown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <span>Worst Selling Products</span>
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-lg">
                Low or zero sales • {products.length} products need attention
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
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

      {/* Alert Banner — compact on mobile */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 md:gap-4 shadow-md sm:shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            className="flex-shrink-0"
          >
            <FiAlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-600" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-yellow-900 text-sm sm:text-base md:text-lg">
              Action Required: {products.filter(p => p.totalQuantity === 0).length} products have zero sales
            </p>
            <p className="text-xs sm:text-sm text-yellow-800 mt-0.5 sm:mt-1">
              Consider reviewing pricing, marketing, or removing these products.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters Section — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-xl border-2 border-red-200 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex-shrink-0">
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
                <FiBarChart2 className="w-4 h-4 text-red-500" />
                Limit
              </label>
              <Input
                type="number"
                placeholder="50"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiTarget className="w-4 h-4 text-red-500" />
                Max Quantity
              </label>
              <Input
                type="number"
                placeholder="10"
                value={filters.maxQuantity}
                onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-red-500" />
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-[#000000] flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-red-500" />
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="border-2 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </motion.div>
            <div className="flex items-end gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-0 text-white font-semibold shadow-lg w-full"
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
            const rankBadge = getRankBadge(index, product.totalQuantity);
            return (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 ${
                  product.totalQuantity === 0
                    ? 'border-red-300 hover:border-red-500'
                    : product.totalQuantity <= 2
                    ? 'border-orange-300 hover:border-orange-500'
                    : 'border-yellow-300 hover:border-yellow-500'
                } transition-all overflow-hidden group`}
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 md:gap-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${rankBadge.bg} rounded-lg sm:rounded-xl flex flex-col items-center justify-center shadow-lg ${rankBadge.text} font-bold relative overflow-hidden py-1`}
                      >
                        {rankBadge.icon ? (
                          <rankBadge.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mb-0.5" />
                        ) : (
                          <span className="text-lg sm:text-xl md:text-2xl">{rankBadge.label}</span>
                        )}
                        <span className="text-[8px] sm:text-[10px] md:text-xs font-semibold mt-0.5">{rankBadge.subLabel}</span>
                      </motion.div>
                    </div>

                    {/* Product Image & Info */}
                    <div className="flex-1 flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      {product.image && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0 relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg sm:rounded-xl blur-sm"></div>
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-cover rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200 relative z-10"
                          />
                        </motion.div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#000000] mb-0.5 sm:mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
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
                        className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 ${
                          product.totalQuantity === 0
                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                            : 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiPackage className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${product.totalQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`} />
                          <p className={`text-[10px] sm:text-xs font-semibold truncate ${product.totalQuantity === 0 ? 'text-red-700' : 'text-orange-700'}`}>
                            Qty Sold
                          </p>
                        </div>
                        <p className={`text-sm sm:text-base md:text-xl font-bold tabular-nums ${product.totalQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.totalQuantity.toLocaleString()}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 ${
                          product.totalRevenue === 0
                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                            : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiDollarSign className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${product.totalRevenue === 0 ? 'text-red-600' : 'text-yellow-600'}`} />
                          <p className={`text-[10px] sm:text-xs font-semibold truncate ${product.totalRevenue === 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                            Revenue
                          </p>
                        </div>
                        <p className={`text-sm sm:text-base md:text-xl font-bold tabular-nums truncate ${product.totalRevenue === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 ${
                          product.orderCount === 0
                            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <FiShoppingBag className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${product.orderCount === 0 ? 'text-red-600' : 'text-gray-600'}`} />
                          <p className={`text-[10px] sm:text-xs font-semibold truncate ${product.orderCount === 0 ? 'text-red-700' : 'text-gray-700'}`}>
                            Orders
                          </p>
                        </div>
                        <p className={`text-sm sm:text-base md:text-xl font-bold tabular-nums ${product.orderCount === 0 ? 'text-red-600' : 'text-gray-600'}`}>
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
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 sm:mb-4 md:mb-6"
          >
            <FiBarChart2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-400" />
          </motion.div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#000000] mb-1 sm:mb-2">No Products Found</h3>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
            No products match the current filter criteria. Try adjusting your filters.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              onClick={handleResetFilters}
              className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] hover:from-[#DB7093] hover:to-[#F9629F] border-0 text-white font-semibold shadow-lg"
            >
              Reset Filters
              <FiRefreshCw className="w-4 h-4 ml-2 inline" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

