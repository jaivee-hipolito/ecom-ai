'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import { IOrder } from '@/types/order';
import ProductImage from '@/components/products/ProductImage';
import { IProduct } from '@/types/product';

export default function DashboardOrdersPage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading orders..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-gray-600">View and track your order history</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('processing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'processing'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setStatusFilter('shipped')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'shipped'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => setStatusFilter('delivered')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'delivered'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Delivered
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Cancelled
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders found</h3>
          <p className="mt-2 text-gray-600">
            {statusFilter === 'all'
              ? "You haven't placed any orders yet."
              : `You don't have any ${statusFilter} orders.`}
          </p>
          <Link href="/dashboard/products" className="inline-block mt-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
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
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-4">
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
                    <div key={index} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.image ? (
                          <ProductImage product={mockProduct} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600">Shipping Address:</p>
                  <p className="text-sm font-medium text-gray-900">
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
                    <p className="text-lg font-bold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <Link href={`/orders/${order._id}`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

