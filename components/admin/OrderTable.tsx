'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiShoppingBag,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiEye,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiChevronRight,
} from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Pagination from '@/components/ui/Pagination';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { Order } from '@/types/order';

interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [page, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.paymentStatus) {
        params.append('paymentStatus', filters.paymentStatus);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data: OrderListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      paymentStatus: '',
    });
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCustomerName = (order: Order) => {
    if (typeof order.user === 'object' && order.user !== null) {
      // Use name field if available (provided by API), otherwise construct from firstName/lastName
      const userName = (order.user as any).name || 
        `${(order.user as any).firstName || ''} ${(order.user as any).lastName || ''}`.trim() ||
        order.shippingAddress?.fullName || 
        'N/A';
      return userName;
    }
    return order.shippingAddress?.fullName || 'Deleted User';
  };

  const getCustomerEmail = (order: Order) => {
    if (typeof order.user === 'object' && order.user !== null) {
      return (order.user as any).email || 'N/A';
    }
    return order.shippingAddress?.phone || 'N/A';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#050b2c] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-[#050b2c] font-semibold text-lg">Loading orders...</p>
        </motion.div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'shipped':
      case 'processing':
        return <FiPackage className="w-4 h-4" />;
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'cancelled':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'from-green-500 to-emerald-600';
      case 'shipped':
      case 'processing':
        return 'from-blue-500 to-cyan-600';
      case 'pending':
        return 'from-yellow-500 to-orange-600';
      case 'cancelled':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'from-green-500 to-emerald-600';
      case 'pending':
        return 'from-yellow-500 to-orange-600';
      case 'failed':
        return 'from-red-500 to-red-600';
      case 'refunded':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg">
              <FiFilter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">Filter Orders</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiSearch className="w-4 h-4 text-[#ffa509]" />
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by order ID, customer name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-2 mb-2">
                <FiShoppingBag className="w-4 h-4 text-[#ffa509]" />
                <label className="block text-sm font-semibold text-[#050b2c]">
                  Order Status
                </label>
              </div>
              <Select
                label=""
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-2 mb-2">
                <FiDollarSign className="w-4 h-4 text-[#ffa509]" />
                <label className="block text-sm font-semibold text-[#050b2c]">
                  Payment Status
                </label>
              </div>
              <Select
                label=""
                options={[
                  { value: '', label: 'All Payment Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'refunded', label: 'Refunded' },
                ]}
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>
          </div>

          <div className="mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-semibold text-[#050b2c] bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#ffa509] transition-all flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Reset Filters
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <FiShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#050b2c]">
                Orders <span className="text-[#ffa509]">({total})</span>
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <FiShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#050b2c] mb-2">No Orders Found</h3>
              <p className="text-gray-600">
                {filters.search || filters.status || filters.paymentStatus
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here when customers place them'}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -5 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-200 hover:border-[#ffa509] transition-all overflow-hidden group"
                    >
                      <Link href={`/admin/orders/${order._id}`}>
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Order Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="px-4 py-2 bg-gradient-to-br from-[#050b2c] to-[#0a1a4a] rounded-lg">
                                  <p className="text-white font-bold text-sm">
                                    #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                                  </p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getStatusColor(order.status)} text-white flex items-center gap-2 text-xs font-semibold`}>
                                  {getStatusIcon(order.status)}
                                  {order.status
                                    ? order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)
                                    : 'N/A'}
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getPaymentStatusColor(order.paymentStatus)} text-white text-xs font-semibold`}>
                                  {order.paymentStatus
                                    ? order.paymentStatus.charAt(0).toUpperCase() +
                                      order.paymentStatus.slice(1)
                                    : 'N/A'}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                                    <FiUser className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Customer</p>
                                    <p className="text-sm font-bold text-[#050b2c]">
                                      {getCustomerName(order)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {getCustomerEmail(order)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                                    <FiPackage className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Items</p>
                                    <p className="text-sm font-bold text-[#050b2c]">
                                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                    </p>
                                    {order.items && order.items.length > 0 && (
                                      <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                        {order.items[0].name}
                                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gradient-to-br from-[#ffa509]/20 to-[#ff8c00]/20 rounded-lg">
                                    <FiDollarSign className="w-5 h-5 text-[#ffa509]" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-600 font-semibold">Amount</p>
                                    <p className="text-lg font-bold text-[#050b2c]">
                                      {formatCurrency(order.totalAmount)}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <FiCalendar className="w-3 h-3" />
                                      {formatDate(order.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-lg text-white group-hover:shadow-lg transition-all"
                              >
                                <FiEye className="w-5 h-5" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
