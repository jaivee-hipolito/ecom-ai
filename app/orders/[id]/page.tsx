'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import ProductImage from '@/components/products/ProductImage';
import { IOrder, IProduct } from '@/types/order';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import OrderTracking from '@/components/orders/OrderTracking';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
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

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'shipped':
        return <FiTruck className="w-5 h-5" />;
      case 'processing':
        return <FiPackage className="w-5 h-5" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <FiXCircle className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/dashboard/orders">
                <button className="px-6 py-2 bg-[#050b2c] text-white rounded-lg hover:bg-[#0a1538] transition-colors">
                  Back to Orders
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard/orders">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-[#050b2c] mb-4 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </motion.button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#050b2c]">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-2 text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusBadgeVariant(order.status)}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
              </Badge>
              <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
                Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Order Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <OrderTracking status={order.status} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-[#050b2c] mb-6 flex items-center gap-2">
                <FiPackage className="w-6 h-6 text-[#ffa509]" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => {
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#ffa509] transition-colors"
                    >
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.image ? (
                          <ProductImage product={mockProduct} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${typeof item.product === 'object' ? item.product._id : item.product}`}>
                          <h3 className="text-lg font-semibold text-[#050b2c] hover:text-[#ffa509] transition-colors mb-2">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                        <p className="text-lg font-bold text-[#ffa509]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-[#050b2c]">
                    Total Amount
                  </span>
                  <span className="text-3xl font-bold text-[#ffa509]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-[#050b2c] mb-4 flex items-center gap-2">
                <FiTruck className="w-6 h-6 text-[#ffa509]" />
                Shipping Address
              </h2>
              {order.shippingAddress && (
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold text-lg text-[#050b2c]">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  {order.shippingAddress.country && (
                    <p>{order.shippingAddress.country}</p>
                  )}
                  {order.shippingAddress.phone && (
                    <p className="pt-2 border-t border-gray-200">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-[#050b2c] mb-4">
                Order Information
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Order ID</dt>
                  <dd className="text-sm font-medium text-gray-900 break-all">
                    {order._id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Payment Method</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {order.paymentMethod || 'N/A'}
                  </dd>
                </div>
                {order.paymentId && (
                  <div>
                    <dt className="text-sm text-gray-600">Payment ID</dt>
                    <dd className="text-sm font-medium text-gray-900 break-all">
                      {order.paymentId}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-600">Order Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(order.createdAt)}
                  </dd>
                </div>
                {order.updatedAt && (
                  <div>
                    <dt className="text-sm text-gray-600">Last Updated</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(order.updatedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
