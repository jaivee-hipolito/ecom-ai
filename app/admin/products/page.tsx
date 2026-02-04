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
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-[#ffa509]">📦</span>
                Product Management
              </h1>
              <p className="text-white/80 text-lg">
                Manage your product catalog, inventory, and pricing
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/products/create">
                <button className="px-6 py-3 bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] font-bold rounded-xl hover:shadow-lg shadow-[#ffa509]/30 transition-all flex items-center gap-2">
                  <FiPlus className="w-5 h-5" />
                  Add New Product
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Products</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-[#050b2c]">{stats.totalProducts.toLocaleString()}</p>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
              <FiPackage className="w-7 h-7 text-[#050b2c]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Featured Products</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-[#050b2c]">{stats.featuredProducts.toLocaleString()}</p>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-7 h-7 text-[#050b2c]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
              {loadingStats ? (
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-[#050b2c]">{formatCurrency(stats.totalRevenue)}</p>
              )}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-7 h-7 text-[#050b2c]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
}
