'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  pendingAmount: number;
  cartItemsCount: number;
  wishlistItemsCount: number;
  averageOrderValue: number;
}

interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount: number;
  firstItem: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
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

  if (isLoading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                Completed Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.completedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.pendingOrders || 0}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                Processing Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.processingOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                Shipped Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.shippedOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                Wishlist Items
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.wishlistItemsCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Cart Items</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.cartItemsCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}{' '}
                      • {formatCurrency(order.totalAmount)} •{' '}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Account Summary Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Summary
        </h2>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">
            Order Statistics
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Total Orders</dt>
              <dd className="text-sm font-medium text-gray-900">
                {stats?.totalOrders || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Completed</dt>
              <dd className="text-sm font-medium text-green-600">
                {stats?.completedOrders || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Pending</dt>
              <dd className="text-sm font-medium text-yellow-600">
                {stats?.pendingOrders || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Cancelled</dt>
              <dd className="text-sm font-medium text-red-600">
                {stats?.cancelledOrders || 0}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/orders"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">View Orders</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          <a
            href="/dashboard/profile"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">My Profile</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          <a
            href="/dashboard/settings"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Account Settings</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          <a
            href="/dashboard/products"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Browse Products</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

