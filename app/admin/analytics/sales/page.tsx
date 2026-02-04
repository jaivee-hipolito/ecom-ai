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
  primary: '#ffa509',
  secondary: '#ff8c00',
  accent: '#050b2c',
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
              <p className="text-white/80 text-lg font-medium">Loading sales analytics...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
        >
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl">
            {error}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
        >
          <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-6 py-4 rounded-xl">
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
                  <FiBarChart2 className="w-8 h-8 text-white" />
                </motion.div>
                Sales Analytics Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Comprehensive overview of your sales performance
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiFilter className="w-5 h-5 text-[#ffa509]" />
          <h2 className="text-xl font-bold text-[#050b2c]">Date Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20"
          />
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20"
          />
          <div className="flex items-end gap-2">
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white border-none hover:from-[#ff8c00] hover:to-[#ffa509] shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-2 border-gray-300 text-[#050b2c] hover:border-[#ffa509] transition-all font-semibold flex items-center gap-2"
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
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiBarChart2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#050b2c] mb-1">No Sales Data Yet</h3>
              <p className="text-gray-600">
                {hasNoRevenue 
                  ? "There are no paid orders in the system. Revenue will appear here once customers complete purchases."
                  : "There are no orders matching the current filter criteria. Try adjusting your date range or check if orders exist in the system."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
            color: 'from-[#ffa509] to-[#ff8c00]',
            bgColor: 'bg-orange-50',
            iconColor: 'text-[#ffa509]',
          },
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${metric.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-[#050b2c]">{metric.value}</p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <metric.icon className={`w-7 h-7 text-white`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sales Trends Graph */}
      {revenueChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#050b2c]">Sales Trends (Last 30 Days)</h2>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke={CHART_COLORS.primary}
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.primary } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke={CHART_COLORS.secondary}
                  label={{ value: 'Orders', angle: 90, position: 'insideRight', style: { fill: CHART_COLORS.secondary } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: `2px solid ${CHART_COLORS.primary}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value, 'Orders'];
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: CHART_COLORS.accent }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: CHART_COLORS.primary, r: 5 }}
                  activeDot={{ r: 7, fill: CHART_COLORS.primary }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={3}
                  name="Orders"
                  dot={{ fill: CHART_COLORS.secondary, r: 5 }}
                  activeDot={{ r: 7, fill: CHART_COLORS.secondary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products Chart - Line Graph */}
        {topProductsChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <FiPackage className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#050b2c]">Top Selling Products</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={topProductsChartData}
                  margin={{ top: 20, right: 30, left: 70, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    stroke="#666"
                    style={{ fontSize: '11px' }}
                    interval={0}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#3B82F6"
                    label={{ value: 'Quantity Sold', angle: -90, position: 'outside', offset: -5, style: { fill: '#3B82F6', textAnchor: 'middle' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#10B981"
                    label={{ value: 'Revenue ($)', angle: 90, position: 'outside', offset: -5, style: { fill: '#10B981', textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #3B82F6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                      return [value, 'Quantity Sold'];
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: CHART_COLORS.accent }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="quantity" 
                    fill="#3B82F6" 
                    name="Quantity Sold"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    fill="#10B981" 
                    name="Revenue"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Category Distribution */}
        {categoryChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <FiBarChart2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#050b2c]">Product Category Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      if (!percent || percent < 0.05) return ''; // Hide labels for slices smaller than 5%
                      return `${name}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={90}
                    innerRadius={30}
                    fill="#3B82F6"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: `2px solid ${CHART_COLORS.primary}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      fontSize: '14px'
                    }}
                    formatter={(value: any, name: string) => {
                      const total = categoryChartData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return [`${value} (${percent}%)`, name];
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                    formatter={(value: string) => {
                      const item = categoryChartData.find(d => d.name === value);
                      if (!item) return value;
                      const total = categoryChartData.reduce((sum, d) => sum + d.value, 0);
                      const percent = ((item.value / total) * 100).toFixed(1);
                      return `${value} (${percent}%)`;
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
          className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
                <FiBarChart2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#050b2c]">Sales by Category</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
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

      {/* Stock Level Summary - Bar Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
              <FiBox className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">Stock Level Summary</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
                whileHover={{ scale: 1.05 }}
                className={`${item.bg} p-4 rounded-xl border-l-4 ${item.border} shadow-md`}
              >
                <p className={`text-sm font-semibold ${item.text}`}>{item.label}</p>
                <p className={`text-2xl font-bold ${item.textDark} mt-2`}>
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
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">Views & Popularity Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${metric.bg} p-4 rounded-xl shadow-md border-2 border-transparent hover:border-[#ffa509]/30 transition-all`}
              >
                <p className={`text-sm font-semibold ${metric.text}`}>{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.textDark} mt-2`}>
                  {metric.value.toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top Products Table */}
      {salesData.topProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 overflow-hidden"
        >
          <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-[#050b2c] to-[#0a1a4a]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Top Selling Products</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#050b2c] uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.topProducts.map((product, index) => (
                  <motion.tr
                    key={product.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image && (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={product.image}
                            alt={product.productName}
                            className="h-12 w-12 object-cover rounded-lg mr-3 border-2 border-gray-200 shadow-sm"
                          />
                        )}
                        <div className="text-sm font-semibold text-[#050b2c]">
                          {product.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {product.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#ffa509]">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
