'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign, 
  FiAlertCircle, 
  FiClock, 
  FiTrendingUp, 
  FiBarChart2,
  FiArrowRight,
  FiTag,
  FiBox,
  FiEye,
  FiChevronRight
} from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';

interface AdminDashboardStats {
  totalProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  inStockProducts: number;
  featuredProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  deliveredRevenue: number;
  pendingRevenue: number;
  totalUsers: number;
  adminUsers: number;
  customerUsers: number;
  averageOrderValue: number;
  totalItemsSold: number;
}

interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount: number;
  customerName: string;
  customerEmail: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStockProducts(data.lowStockProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'primary';
      case 'processing':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
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
              <p className="text-white/80 text-lg font-medium">Loading dashboard...</p>
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
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl shadow-lg"
                >
                  <FiBarChart2 className="w-8 h-8 text-white" />
                </motion.div>
                Admin Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Welcome back, <span className="text-[#ffa509] font-semibold">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin'}</span>! Manage your e-commerce platform.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: 'Products',
            value: stats?.totalProducts || 0,
            subtitle: `${stats?.inStockProducts || 0} in stock`,
            icon: FiPackage,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            textDark: 'text-blue-900',
          },
          {
            title: 'Orders',
            value: stats?.totalOrders || 0,
            subtitle: `${stats?.deliveredOrders || 0} delivered`,
            icon: FiShoppingBag,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            textDark: 'text-green-900',
          },
          {
            title: 'Users',
            value: stats?.totalUsers || 0,
            subtitle: `${stats?.customerUsers || 0} customers`,
            icon: FiUsers,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            textDark: 'text-purple-900',
          },
          {
            title: 'Revenue',
            value: stats ? formatCurrency(stats.totalRevenue) : '$0.00',
            subtitle: `${stats ? formatCurrency(stats.deliveredRevenue) : '$0.00'} delivered`,
            icon: FiDollarSign,
            color: 'from-[#ffa509] to-[#ff8c00]',
            bgColor: 'bg-orange-50',
            textColor: 'text-[#ffa509]',
            textDark: 'text-orange-900',
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-[#050b2c] mb-1">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: 'Out of Stock',
            value: stats?.outOfStockProducts || 0,
            icon: FiAlertCircle,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            textDark: 'text-red-900',
          },
          {
            title: 'Pending Orders',
            value: stats?.pendingOrders || 0,
            icon: FiClock,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            textDark: 'text-orange-900',
          },
          {
            title: 'Items Sold',
            value: stats?.totalItemsSold || 0,
            icon: FiTrendingUp,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            textDark: 'text-indigo-900',
          },
          {
            title: 'Avg Order Value',
            value: stats ? formatCurrency(stats.averageOrderValue) : '$0.00',
            icon: FiBarChart2,
            color: 'from-teal-500 to-teal-600',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
            textDark: 'text-teal-900',
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-[#050b2c]">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
                  <FiArrowRight className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#050b2c]">
                  Quick Actions
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { href: '/admin/products', label: 'Manage Products', icon: FiPackage, color: 'from-blue-500 to-cyan-600' },
                  { href: '/admin/categories', label: 'Manage Categories', icon: FiTag, color: 'from-purple-500 to-pink-600' },
                  { href: '/admin/orders', label: 'Manage Orders', icon: FiShoppingBag, color: 'from-green-500 to-emerald-600' },
                  { href: '/admin/users', label: 'Manage Users', icon: FiUsers, color: 'from-indigo-500 to-indigo-600' },
                  { href: '/admin/analytics', label: 'View Analytics', icon: FiBarChart2, color: 'from-[#ffa509] to-[#ff8c00]' },
                  { href: '/admin/inventory', label: 'Inventory Management', icon: FiBox, color: 'from-orange-500 to-orange-600' },
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={action.href}
                      className="block p-4 border-2 border-gray-200 rounded-xl hover:border-[#ffa509] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${action.color} rounded-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors">
                            {action.label}
                          </span>
                        </div>
                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ffa509] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <FiShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#050b2c]">
                    Recent Orders
                  </h2>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-sm text-[#ffa509] hover:text-[#ff8c00] font-semibold flex items-center gap-1 transition-colors"
                >
                  View All
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="block p-4 border-2 border-gray-200 rounded-xl hover:border-[#ffa509] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm font-bold text-[#050b2c]">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {order.customerName} • {order.itemsCount} item
                            {order.itemsCount !== 1 ? 's' : ''} •{' '}
                            <span className="font-semibold text-[#ffa509]">{formatCurrency(order.totalAmount)}</span> •{' '}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ffa509] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                  <FiShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No recent orders</p>
                <p className="text-sm text-gray-500 mt-2">
                  Orders will appear here as customers place them
                </p>
              </div>
            )}
            </div>
          </motion.div>
        </div>

      {/* Account Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">
              Account Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
          >
            <h3 className="text-sm font-bold text-blue-700 mb-4 flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Products Overview
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Total Products</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats?.totalProducts || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">In Stock</dt>
                <dd className="text-sm font-bold text-green-600">
                  {stats?.inStockProducts || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Low Stock</dt>
                <dd className="text-sm font-bold text-yellow-600">
                  {stats?.lowStockProducts || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Out of Stock</dt>
                <dd className="text-sm font-bold text-red-600">
                  {stats?.outOfStockProducts || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Featured</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats?.featuredProducts || 0}
                </dd>
              </div>
            </dl>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
          >
            <h3 className="text-sm font-bold text-green-700 mb-4 flex items-center gap-2">
              <FiShoppingBag className="w-4 h-4" />
              Orders Overview
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Total Orders</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats?.totalOrders || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Delivered</dt>
                <dd className="text-sm font-bold text-green-600">
                  {stats?.deliveredOrders || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Shipped</dt>
                <dd className="text-sm font-bold text-blue-600">
                  {stats?.shippedOrders || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Processing</dt>
                <dd className="text-sm font-bold text-yellow-600">
                  {stats?.processingOrders || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Pending</dt>
                <dd className="text-sm font-bold text-orange-600">
                  {stats?.pendingOrders || 0}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Cancelled</dt>
                <dd className="text-sm font-bold text-red-600">
                  {stats?.cancelledOrders || 0}
                </dd>
              </div>
            </dl>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 bg-gradient-to-br from-[#ffa509]/10 to-[#ff8c00]/10 rounded-xl border-2 border-[#ffa509]/30"
          >
            <h3 className="text-sm font-bold text-[#ffa509] mb-4 flex items-center gap-2">
              <FiDollarSign className="w-4 h-4" />
              Financial Overview
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Total Revenue</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats ? formatCurrency(stats.totalRevenue) : '$0.00'}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Delivered Revenue</dt>
                <dd className="text-sm font-bold text-green-600">
                  {stats ? formatCurrency(stats.deliveredRevenue) : '$0.00'}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Pending Revenue</dt>
                <dd className="text-sm font-bold text-yellow-600">
                  {stats ? formatCurrency(stats.pendingRevenue) : '$0.00'}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Avg Order Value</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats ? formatCurrency(stats.averageOrderValue) : '$0.00'}
                </dd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/50 transition-colors">
                <dt className="text-sm text-gray-700 font-medium">Total Items Sold</dt>
                <dd className="text-sm font-bold text-[#050b2c]">
                  {stats?.totalItemsSold || 0}
                </dd>
              </div>
            </dl>
          </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-yellow-900">
                  Low Stock Alert
                </h2>
              </div>
              <Link
                href="/admin/inventory"
                className="text-sm text-yellow-700 hover:text-yellow-900 font-semibold flex items-center gap-1 transition-colors"
              >
                Manage Inventory
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-sm text-yellow-800 mb-4 font-medium">
              {lowStockProducts.length} product
              {lowStockProducts.length !== 1 ? 's' : ''} running low on stock
            </p>
            <div className="space-y-2">
              {lowStockProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.05 }}
                  className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all shadow-sm"
                >
                  <span className="text-sm font-semibold text-[#050b2c]">
                    {product.name}
                  </span>
                  <span className="px-3 py-1 text-sm text-yellow-700 font-bold bg-yellow-100 rounded-lg border border-yellow-300">
                    {product.stock} left
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
