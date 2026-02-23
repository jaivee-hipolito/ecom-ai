'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Order, IOrderHistoryEntry } from '@/types/order';
import { FiClock, FiUser } from 'react-icons/fi';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setStatus(order.status || '');
      setPaymentStatus(order.paymentStatus || '');
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/orders/${orderId}`);
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

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccessMessage('');

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status !== order?.status ? status : undefined,
          paymentStatus: paymentStatus !== order?.paymentStatus ? paymentStatus : undefined,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      setOrder(data.order);
      setSuccessMessage('Order updated successfully!');
      setComment('');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setUpdating(false);
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

  const getCustomerName = () => {
    if (typeof order?.user === 'object' && order.user !== null) {
      return (order.user as any).name || order.shippingAddress?.fullName || 'N/A';
    }
    return order?.shippingAddress?.fullName || 'N/A';
  };

  const getCustomerEmail = () => {
    if (typeof order?.user === 'object' && order.user !== null) {
      return (order.user as any).email || 'N/A';
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <Alert variant="error">{error}</Alert>
          <div className="mt-4">
            <Link href="/admin/orders">
              <Button variant="outline">Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const hasChanges = status !== order.status || paymentStatus !== order.paymentStatus;
  const canUpdate = hasChanges && comment.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order._id?.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-2 text-gray-600">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              {(() => {
                const subtotal = order.items?.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                ) ?? 0;
                const shipping = order.shippingFee ?? 0;
                const couponAmount = order.coupon?.discountAmount ?? 0;
                const verificationDiscount = order.verificationDiscount ?? 0;
                return (
                  <>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {order.coupon && couponAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount ({order.coupon.code})</span>
                        <span>-{formatCurrency(couponAmount)}</span>
                      </div>
                    )}
                    {verificationDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Verification discount</span>
                        <span>-{formatCurrency(verificationDiscount)}</span>
                      </div>
                    )}
                    {shipping > 0 && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Shipping</span>
                        <span>{formatCurrency(shipping)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            {order.shippingAddress && (
              <div className="space-y-2 text-gray-700">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2 border-t border-gray-200">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{getCustomerName()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{getCustomerEmail()}</p>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Update Order Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <Select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'refunded', label: 'Refunded' },
                  ]}
                />
              </div>
              {hasChanges && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Explain why the status is being changed..."
                    rows={3}
                    required
                    className="border-gray-300 focus:border-[#F9629F] focus:ring-[#F9629F]/20"
                  />
                </div>
              )}
              {hasChanges && (
                <Button
                  variant="primary"
                  onClick={handleUpdateStatus}
                  isLoading={updating}
                  disabled={!canUpdate}
                  className="w-full"
                >
                  Update Order
                </Button>
              )}
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-600">Order ID</dt>
                <dd className="text-sm font-medium text-gray-900">
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
                <dt className="text-sm text-gray-600">Created At</dt>
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
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiClock className="w-5 h-5 text-[#F9629F]" />
          Order History
        </h2>
        {order.history && order.history.length > 0 ? (
          <div className="space-y-4">
            {([...order.history].reverse()).map((entry: IOrderHistoryEntry, index: number) => (
              <div
                key={index}
                className="flex gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FDE8F0] flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-[#F9629F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {entry.modifiedByName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(entry.changedAt)}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {entry.changes?.map((change, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        <span className="font-medium capitalize">{change.field.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                        <span className="text-gray-500 line-through">{change.from}</span>
                        {' → '}
                        <span className="font-medium text-gray-900">{change.to}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600 border-l-2 border-[#F9629F] pl-3">
                    <span className="font-medium text-gray-700">Note: </span>
                    <span className="italic">
                      {(entry as IOrderHistoryEntry).note?.trim()
                        ? `"${(entry as IOrderHistoryEntry).note}"`
                        : '—'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No changes recorded yet. Updates to order or payment status will appear here.</p>
        )}
      </div>
    </div>
  );
}
