'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import OrderTable from '@/components/admin/OrderTable';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  growth: number;
}

export default function AdminOrdersPage() {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    growth: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch all-time stats
      const statsResponse = await fetch('/api/admin/dashboard/stats');
      const statsData = await statsResponse.json();

      if (statsResponse.ok && statsData.stats) {
        const totalOrders = statsData.stats.totalOrders || 0;
        const totalRevenue = statsData.stats.totalRevenue || 0;

        // Calculate month-over-month growth
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Fetch current month and previous month stats for growth calculation
        const [currentMonthResponse, prevMonthResponse] = await Promise.all([
          fetch(
            `/api/admin/analytics/sales?startDate=${currentMonthStart.toISOString()}&endDate=${currentMonthEnd.toISOString()}`
          ),
          fetch(
            `/api/admin/analytics/sales?startDate=${previousMonthStart.toISOString()}&endDate=${previousMonthEnd.toISOString()}`
          ),
        ]);

        const currentMonthData = await currentMonthResponse.json();
        const prevMonthData = await prevMonthResponse.json();

        const currentMonthOrders = currentMonthData.totalOrders || 0;
        const previousMonthOrders = prevMonthData.totalOrders || 0;

        // Calculate growth percentage based on month-over-month orders
        let growth = 0;
        if (previousMonthOrders > 0) {
          growth = ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100;
        } else if (currentMonthOrders > 0) {
          growth = 100; // 100% growth if there were no orders in previous month
        }

        setStats({
          totalOrders,
          totalRevenue,
          growth,
        });
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
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

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                >
                  <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <span>Order Management</span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg">
                View and manage all customer orders
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 min-w-0"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-[#ffa509]/20 flex items-center justify-center">
                    <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ffa509]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Total Orders</p>
                    {loadingStats ? (
                      <div className="h-6 w-16 bg-white/20 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-base sm:text-lg md:text-xl font-bold truncate tabular-nums">{stats.totalOrders.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 min-w-0"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-[#ffa509]/20 flex items-center justify-center">
                    <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ffa509]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Revenue</p>
                    {loadingStats ? (
                      <div className="h-5 sm:h-6 w-14 sm:w-20 bg-white/20 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className="text-base sm:text-lg md:text-xl font-bold truncate tabular-nums">{formatCurrency(stats.totalRevenue)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 min-w-0 col-span-2 lg:col-span-1"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-[#ffa509]/20 flex items-center justify-center">
                    <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#ffa509]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Growth (MoM)</p>
                    {loadingStats ? (
                      <div className="h-5 sm:h-6 w-12 sm:w-16 bg-white/20 rounded animate-pulse mt-1"></div>
                    ) : (
                      <p className={`text-base sm:text-lg md:text-xl font-bold truncate tabular-nums ${stats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatGrowth(stats.growth)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <OrderTable />
    </div>
  );
}

