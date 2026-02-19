'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductTable from '@/components/admin/ProductTable';
import Link from 'next/link';
import { FiPackage, FiPlus, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

interface ProductStats {
  totalProducts: number;
  featuredProducts: number;
  totalRevenue: number;
}

export default function AdminProductsPage() {
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    featuredProducts: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();

      if (response.ok && data.stats) {
        setStats({
          totalProducts: data.stats.totalProducts || 0,
          featuredProducts: data.stats.featuredProducts || 0,
          totalRevenue: data.stats.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#1a1a2e] to-[#050b2c] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.12),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <span className="text-[#ffa509]">📦</span>
                <span className="truncate">Product Management</span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg">
                Manage your product catalog, inventory, and pricing
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0">
              <Link href="/admin/products/create" className="cursor-pointer">
                <button className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#ffa509] to-[#F9629F] text-[#000000] font-bold rounded-lg sm:rounded-xl hover:shadow-lg shadow-[#F9629F]/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base cursor-pointer">
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Product
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0.5 sm:mb-1">Total Products</p>
              {loadingStats ? (
                <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-lg sm:text-xl md:text-3xl font-bold text-[#000000] tabular-nums">{stats.totalProducts.toLocaleString()}</p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#000000]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0.5 sm:mb-1">Featured</p>
              {loadingStats ? (
                <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-lg sm:text-xl md:text-3xl font-bold text-[#000000] tabular-nums">{stats.featuredProducts.toLocaleString()}</p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#000000]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0.5 sm:mb-1">Total Revenue</p>
              {loadingStats ? (
                <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-lg sm:text-xl md:text-3xl font-bold text-[#000000] tabular-nums truncate">{formatCurrency(stats.totalRevenue)}</p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#000000]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Product Table - filters hidden by default per owner request */}
      <ProductTable filtersDefaultHidden />
    </div>
  );
}
