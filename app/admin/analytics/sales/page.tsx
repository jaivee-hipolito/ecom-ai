'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiBarChart2, FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp, FiFilter, FiRefreshCw, FiEye, FiBox } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueByDate: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    image: string;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  stockSummary: {
    totalStock: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  viewsMetrics: {
    totalViews: number;
    averageViews: number;
    maxViews: number;
    productsWithViews: number;
  };
  salesByCategory: Array<{
    category: string;
    totalRevenue: number;
    totalQuantity: number;
  }>;
}

// Professional color palette for category distribution
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#14B8A6', // Teal
];
const CHART_COLORS = {
  primary: '#F9629F',
  secondary: '#DB7093',
  accent: '#000000',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export default function SalesAnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/analytics/sales?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sales analytics');
      }

      setSalesData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchSalesData();
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    setTimeout(() => fetchSalesData(), 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium">Loading sales analytics...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-4 sm:p-6 md:p-8"
        >
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
            {error}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-4 sm:p-6 md:p-8"
        >
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base">
            No data available. Please create orders to see analytics.
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if we have meaningful data
  const hasNoOrders = salesData.totalOrders === 0;
  const hasNoRevenue = salesData.totalRevenue === 0;

  // Prepare chart data
  const revenueChartData = salesData.revenueByDate.map((item) => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const topProductsChartData = salesData.topProducts.slice(0, 10).map((product) => ({
    name: product.productName.length > 20 
      ? product.productName.substring(0, 20) + '...' 
      : product.productName,
    quantity: product.totalQuantity,
    revenue: product.totalRevenue,
  }));

  const categoryChartData = salesData.categoryDistribution.slice(0, 6).map((item) => ({
    name: item.category,
    value: item.count,
  }));

  const salesByCategoryData = salesData.salesByCategory.slice(0, 8).map((item) => ({
    name: item.category.length > 15 ? item.category.substring(0, 15) + '...' : item.category,
    revenue: item.totalRevenue,
    quantity: item.totalQuantity,
  }));

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
                  <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <span>Sales Analytics Dashboard</span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-lg">
                Comprehensive overview of your sales performance
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
          <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F] flex-shrink-0" />
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Date Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="bg-white border-2 border-gray-200 focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20"
          />
          <div className="flex items-end gap-2">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white border-none hover:from-[#DB7093] hover:to-[#F9629F] shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-2 border-gray-300 text-[#000000] hover:border-[#F9629F] transition-all font-semibold flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </motion.div>

      {/* No Data Message */}
      {hasNoOrders && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#000000] mb-0.5 sm:mb-1">No Sales Data Yet</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                {hasNoRevenue 
                  ? "There are no paid orders in the system. Revenue will appear here once customers complete purchases."
                  : "There are no orders matching the current filter criteria. Try adjusting your date range or check if orders exist in the system."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Metrics Cards — compact on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6"
      >
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(salesData.totalRevenue),
            icon: FiDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
          },
          {
            title: 'Total Orders',
            value: salesData.totalOrders.toLocaleString(),
            icon: FiShoppingBag,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
          {
            title: 'Total Products',
            value: salesData.totalProducts.toLocaleString(),
            icon: FiPackage,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
          },
          {
            title: 'Avg Order Value',
            value: formatCurrency(salesData.averageOrderValue),
            icon: FiTrendingUp,
            color: 'from-[#F9629F] to-[#DB7093]',
            bgColor: 'bg-orange-50',
            iconColor: 'text-[#F9629F]',
          },
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-2.5 sm:p-4 md:p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br ${metric.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative z-10 flex items-center justify-between gap-1 sm:gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0 sm:mb-1 truncate">{metric.title}</p>
                <p className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#000000] truncate tabular-nums">{metric.value}</p>
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-gradient-to-br ${metric.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                <metric.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Top Selling Products — table first, then chart */}
      {salesData.topProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200/80 overflow-hidden"
        >
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
                <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Top Selling Products</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Ranked by quantity sold</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider w-10 sm:w-12">
                    #
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Quantity sold
                  </th>
                  <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesData.topProducts.map((product, index) => (
                  <motion.tr
                    key={product.productId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 + index * 0.03 }}
                    className="group transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-400 tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            <FiPackage className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[220px] md:max-w-none">
                          {product.productName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-700 tabular-nums">
                      {product.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      {topProductsChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200/80 p-3 sm:p-4 md:p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex-shrink-0">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base md:text-xl font-bold text-gray-900">Top Selling Products</h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">By quantity sold and revenue</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                data={topProductsChartData}
                margin={{ top: 16, right: 24, left: 8, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={72}
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  width={44}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  width={52}
                  tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    padding: '10px 14px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value.toLocaleString(), 'Quantity sold'];
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: '6px', color: '#111827' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px' }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (value === 'Quantity Sold' ? 'Quantity sold' : value)}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="quantity" 
                  fill="#2563eb"
                  name="Quantity Sold"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="revenue" 
                  fill="#059669"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Sales Trends — professional styling */}
      {revenueChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200/80 p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-2 sm:mb-3 md:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
                  <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">Sales Trends</h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Revenue and order count · Last 30 days</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChartData} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={64}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  width={48}
                  tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  width={36}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    padding: '10px 14px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value?.toLocaleString?.() ?? value, 'Orders'];
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: '6px', color: '#111827' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '12px' }}
                  iconType="line"
                  iconSize={8}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: '#059669', r: 3 }}
                  activeDot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Orders"
                  dot={{ fill: '#2563eb', r: 3 }}
                  activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Charts Row — Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Category Distribution */}
        {categoryChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
                  <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold text-[#000000]">Category Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart margin={{ top: 16, right: 4, bottom: 16, left: 4 }}>
                  <Pie
                    data={categoryChartData}
                    cx="42%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={72}
                    paddingAngle={1.5}
                    dataKey="value"
                    fill="#3B82F6"
                    stroke="#fff"
                    strokeWidth={1.5}
                    labelLine={false}
                    label={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: `1px solid #e5e7eb`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                      padding: '10px 14px'
                    }}
                    formatter={(value: any, name: string) => {
                      const total = categoryChartData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return [`${value} products (${percent}%)`, name];
                    }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ paddingLeft: '16px' }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => {
                      const item = categoryChartData.find(d => d.name === value);
                      if (!item) return value;
                      const total = categoryChartData.reduce((sum, d) => sum + d.value, 0);
                      const percent = ((item.value / total) * 100).toFixed(1);
                      return `${value} · ${percent}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sales by Category Chart */}
      {salesByCategoryData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
                <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-sm sm:text-base md:text-xl font-bold text-[#000000]">Sales by Category</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#666" />
                <YAxis yAxisId="left" stroke="#8B5CF6" />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #8B5CF6',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return formatCurrency(value);
                    return value;
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: CHART_COLORS.accent }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="quantity" fill="#F59E0B" name="Quantity" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Stock Level Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
              <FiBox className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-[#000000]">Stock Level Summary</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={[
                {
                  name: 'Total Stock',
                  value: salesData.stockSummary.totalStock,
                  color: '#3B82F6',
                },
                {
                  name: 'In Stock',
                  value: salesData.stockSummary.inStock,
                  color: '#10B981',
                },
                {
                  name: 'Low Stock',
                  value: salesData.stockSummary.lowStock,
                  color: '#F59E0B',
                },
                {
                  name: 'Out of Stock',
                  value: salesData.stockSummary.outOfStock,
                  color: '#EF4444',
                },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666"
                label={{ value: 'Number of Products', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: `2px solid ${CHART_COLORS.primary}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [value.toLocaleString(), 'Products']}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: CHART_COLORS.accent }}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
              >
                {[
                  { name: 'Total Stock', value: salesData.stockSummary.totalStock, color: '#3B82F6' },
                  { name: 'In Stock', value: salesData.stockSummary.inStock, color: '#10B981' },
                  { name: 'Low Stock', value: salesData.stockSummary.lowStock, color: '#F59E0B' },
                  { name: 'Out of Stock', value: salesData.stockSummary.outOfStock, color: '#EF4444' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Summary Cards Below Chart */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
            {[
              { label: 'Total Stock', value: salesData.stockSummary.totalStock, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', textDark: 'text-blue-900' },
              { label: 'In Stock', value: salesData.stockSummary.inStock, color: 'green', bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', textDark: 'text-green-900' },
              { label: 'Low Stock (<10)', value: salesData.stockSummary.lowStock, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-600', textDark: 'text-yellow-900' },
              { label: 'Out of Stock', value: salesData.stockSummary.outOfStock, color: 'red', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', textDark: 'text-red-900' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`${item.bg} p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-l-4 ${item.border} shadow-md`}
              >
                <p className={`text-[10px] sm:text-xs md:text-sm font-semibold ${item.text} truncate`}>{item.label}</p>
                <p className={`text-sm sm:text-lg md:text-2xl font-bold ${item.textDark} mt-0.5 sm:mt-1 md:mt-2 tabular-nums`}>
                  {item.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Views/Popularity Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
              <FiEye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-sm sm:text-base md:text-xl font-bold text-[#000000]">Views & Popularity</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { label: 'Total Views', value: salesData.viewsMetrics.totalViews, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', textDark: 'text-indigo-900' },
              { label: 'Average Views', value: Math.round(salesData.viewsMetrics.averageViews), color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600', textDark: 'text-purple-900' },
              { label: 'Max Views', value: salesData.viewsMetrics.maxViews, color: 'pink', bg: 'bg-pink-50', text: 'text-pink-600', textDark: 'text-pink-900' },
              { label: 'Products with Views', value: salesData.viewsMetrics.productsWithViews, color: 'teal', bg: 'bg-teal-50', text: 'text-teal-600', textDark: 'text-teal-900' },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`${metric.bg} p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#F9629F]/30 transition-all`}
              >
                <p className={`text-[10px] sm:text-xs md:text-sm font-semibold ${metric.text} truncate`}>{metric.label}</p>
                <p className={`text-sm sm:text-lg md:text-2xl font-bold ${metric.textDark} mt-0.5 sm:mt-1 md:mt-2 tabular-nums`}>
                  {metric.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
