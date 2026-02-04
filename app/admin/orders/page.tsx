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
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl shadow-lg"
                >
                  <FiShoppingBag className="w-8 h-8 text-white" />
                </motion.div>
                Order Management
              </h1>
              <p className="text-white/80 text-lg">
                View and manage all customer orders
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiPackage className="w-5 h-5 text-[#ffa509]" />
                  <div>
                    <p className="text-xs text-white/70">Total Orders</p>
                    {loadingStats ? (
                      <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiDollarSign className="w-5 h-5 text-[#ffa509]" />
                  <div>
                    <p className="text-xs text-white/70">Revenue</p>
                    {loadingStats ? (
                      <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiTrendingUp className="w-5 h-5 text-[#ffa509]" />
                  <div>
                    <p className="text-xs text-white/70">Growth</p>
                    {loadingStats ? (
                      <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                    ) : (
                      <p className={`text-xl font-bold ${stats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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

