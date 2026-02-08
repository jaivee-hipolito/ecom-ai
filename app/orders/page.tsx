'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { IOrder } from '@/types/order';
import ProductImage from '@/components/products/ProductImage';
import { IProduct } from '@/types/product';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = statusFilter === 'all' 
        ? '/api/orders' 
        : `/api/orders?status=${statusFilter}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading orders..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
  return null;
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-[#ffa509] hover:text-[#ff8c00] mb-4 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-3 rounded-xl shadow-lg">
              <FiShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#050b2c]">My Orders</h1>
              <p className="mt-2 text-gray-600">View and track your order history</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 shadow-lg"
          >
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'pending'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'processing'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'shipped'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'delivered'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              statusFilter === 'cancelled'
                ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
            }`}
          >
            Cancelled
          </button>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
          >
            <div className="bg-gradient-to-br from-[#ffa509]/10 to-[#ff8c00]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-[#ffa509]" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-[#050b2c]">No orders found</h3>
            <p className="mt-2 text-gray-600 text-lg">
              {statusFilter === 'all'
                ? "You haven't placed any orders yet."
                : `You don't have any ${statusFilter} orders.`}
            </p>
            <Link href="/dashboard/products" className="inline-block mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg"
              >
                Start Shopping
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl font-bold text-[#050b2c]">
                      Order #{order._id?.substring(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on{' '}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  {order.items.map((item, itemIndex) => {
                    const product = typeof item.product === 'object' ? item.product : null;
                    const mockProduct: IProduct = product || {
                      _id: typeof item.product === 'string' ? item.product : '',
                      name: item.name,
                      coverImage: item.image,
                      images: item.image ? [item.image] : [],
                      price: item.price,
                      description: '',
                      category: '',
                      stock: 0,
                    };

                    return (
                      <div key={itemIndex} className="flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                          {item.image ? (
                            <ProductImage product={mockProduct} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiPackage className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-[#050b2c]">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-base font-bold bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent mt-1">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-sm font-medium text-gray-600">Shipping Address:</p>
                    <p className="text-sm font-bold text-[#050b2c]">
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <Link href={`/orders/${order._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-xl hover:shadow-lg transition-all font-bold"
                      >
                        View Details
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
