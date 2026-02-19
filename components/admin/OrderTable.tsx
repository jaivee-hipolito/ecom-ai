'use client';

import { useState, useEffect, useRef } from 'react';
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
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiChevronRight,
  FiArrowDown,
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
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  const STORAGE_KEY = 'adminOrdersListState';

  const loadSavedState = () => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  // Filters
  const [filters, setFilters] = useState({
    searchOrderId: '',
    searchCustomer: '',
    searchAmount: '',
    searchItemName: '',
    status: '',
    paymentStatus: '',
  });

  // Sort: date modified (updatedAt), customer, order status, payment status, items, amount
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPageInternal] = useState(1);

  // Restore saved state on mount (e.g. when navigating back from order detail)
  useEffect(() => {
    const state = loadSavedState();
    if (state) {
      if (state.filters) setFilters((prev) => ({ ...prev, ...state.filters }));
      if (state.sortBy) setSortBy(state.sortBy);
      if (state.sortOrder) setSortOrder(state.sortOrder);
      if (state.page != null) setPageInternal(state.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPage = (p: number) => setPageInternal(p);

  useEffect(() => {
    const abortController = new AbortController();
    const run = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (filters.searchOrderId) params.append('searchOrderId', filters.searchOrderId);
        if (filters.searchCustomer) params.append('searchCustomer', filters.searchCustomer);
        if (filters.searchAmount) params.append('searchAmount', filters.searchAmount);
        if (filters.searchItemName) params.append('searchItemName', filters.searchItemName);
        if (filters.status) {
          params.append('status', filters.status);
        }
        if (filters.paymentStatus) {
          params.append('paymentStatus', filters.paymentStatus);
        }
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);

        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          signal: abortController.signal,
        });
        const data: OrderListResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        setOrders(data.orders || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters, sortBy, sortOrder]);

  // Persist state to sessionStorage when filters/sort/page change (so Back to Orders can restore)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip first run: restore effect may have just loaded saved state; saving now would overwrite with defaults
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ filters, sortBy, sortOrder, page })
      );
    } catch {
      /* ignore */
    }
  }, [filters, sortBy, sortOrder, page]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      searchOrderId: '',
      searchCustomer: '',
      searchAmount: '',
      searchItemName: '',
      status: '',
      paymentStatus: '',
    });
    setSortBy('updatedAt');
    setSortOrder('desc');
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
      <div className="flex justify-center items-center py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-[#000000] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-3 sm:mt-4 text-[#000000] font-semibold text-sm sm:text-lg">Loading orders...</p>
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
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full">
      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
              <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Filter Orders</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                Order ID
              </label>
              <Input
                type="text"
                placeholder="Search by order ID..."
                value={filters.searchOrderId}
                onChange={(e) => handleFilterChange('searchOrderId', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                Customer Name
              </label>
              <Input
                type="text"
                placeholder="Search by customer name..."
                value={filters.searchCustomer}
                onChange={(e) => handleFilterChange('searchCustomer', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                Amount
              </label>
              <Input
                type="text"
                placeholder="Search by amount (e.g. 99.99)"
                value={filters.searchAmount}
                onChange={(e) => handleFilterChange('searchAmount', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                Item Name
              </label>
              <Input
                type="text"
                placeholder="Search by item name..."
                value={filters.searchItemName}
                onChange={(e) => handleFilterChange('searchItemName', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <FiShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                <label className="block text-xs sm:text-sm font-semibold text-[#000000]">
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
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                <label className="block text-xs sm:text-sm font-semibold text-[#000000]">
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
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white"
              />
            </motion.div>
          </div>

          {/* Sort */}
          <div className="mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                <FiArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F9629F]" />
                Sort by
              </label>
              <Select
                label=""
                options={[
                  { value: 'updatedAt', label: 'Date modified' },
                  { value: 'createdAt', label: 'Date created' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'status', label: 'Order status' },
                  { value: 'paymentStatus', label: 'Payment status' },
                  { value: 'items', label: 'Items count' },
                  { value: 'amount', label: 'Amount' },
                ]}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-1.5 sm:mb-2">
                Order
              </label>
              <Select
                label=""
                options={[
                  { value: 'desc', label: 'Newest / Z–A / High first' },
                  { value: 'asc', label: 'Oldest / A–Z / Low first' },
                ]}
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'asc' | 'desc');
                  setPage(1);
                }}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white"
              />
            </motion.div>
          </div>

          <div className="mt-3 sm:mt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handleResetFilters}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#000000] bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#F9629F] transition-all flex items-center gap-1.5 sm:gap-2"
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex-shrink-0">
                <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">
                Orders <span className="text-[#F9629F]">({total})</span>
              </h2>
            </div>
          </div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 sm:mb-4">
                <FiShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#000000] mb-2">No Orders Found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                {filters.searchOrderId || filters.searchCustomer || filters.searchAmount || filters.searchItemName || filters.status || filters.paymentStatus
                  ? 'Try adjusting your filters'
                  : 'Orders will appear here when customers place them'}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.005, y: -2 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-gray-200 hover:border-[#F9629F] transition-all overflow-hidden group"
                    >
                      <Link href={`/admin/orders/${order._id}`} className="block">
                        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                          {/* Row 1: Order ID + Status badges */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-gradient-to-br from-[#050b2c] to-[#1a1a2e] rounded-md sm:rounded-lg shrink-0 w-fit">
                              <p className="text-white font-bold text-xs sm:text-sm tabular-nums">
                                #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                              </p>
                            </div>
                            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r ${getStatusColor(order.status)} text-white flex items-center gap-1 text-[10px] sm:text-xs font-semibold shrink-0 whitespace-nowrap`}>
                              {getStatusIcon(order.status)}
                              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                            </div>
                            <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r ${getPaymentStatusColor(order.paymentStatus)} text-white flex items-center shrink-0 text-[10px] sm:text-xs font-semibold whitespace-nowrap`}>
                              {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'N/A'}
                            </div>
                          </div>

                          {/* Row 2: Customer, Items, Amount - compact grid (stack on mobile, 3 cols on sm+) */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-md sm:rounded-lg flex-shrink-0">
                                <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">Customer</p>
                                <p className="text-xs sm:text-sm font-bold text-[#000000] truncate">
                                  {getCustomerName(order)}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                  {getCustomerEmail(order)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md sm:rounded-lg flex-shrink-0">
                                <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">Items</p>
                                <p className="text-xs sm:text-sm font-bold text-[#000000]">
                                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                </p>
                                {order.items && order.items.length > 0 && (
                                  <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-full">
                                    {order.items[0].name}
                                    {order.items.length > 1 && ` +${order.items.length - 1}`}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F]/20 to-[#DB7093]/20 rounded-md sm:rounded-lg flex-shrink-0">
                                <FiDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#F9629F]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold">Amount</p>
                                <p className="text-sm sm:text-base md:text-lg font-bold text-[#000000] tabular-nums">
                                  {formatCurrency(order.totalAmount)}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                                  <FiCalendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{formatDate(order.createdAt)}</span>
                                </div>
                              </div>
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
                <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t-2 border-gray-200">
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
