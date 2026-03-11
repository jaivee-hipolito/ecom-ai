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
import { Order, IOrderHistoryEntry, ITrackingEvent } from '@/types/order';
import { FiClock, FiUser, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { getSizeAndColorFromAttributes } from '@/lib/orderItemAttributes';

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
  const [trackingInput, setTrackingInput] = useState('');
  const [carrier, setCarrier] = useState('Canada Post');
  const [refreshTrackingLoading, setRefreshTrackingLoading] = useState(false);
  const [createLabelLoading, setCreateLabelLoading] = useState(false);

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

      const payload: Record<string, unknown> = {
        comment: comment.trim(),
      };
      if (status !== order?.status) payload.status = status;
      if (paymentStatus !== order?.paymentStatus) payload.paymentStatus = paymentStatus;
      const addingTracking = trackingInput.trim() && !order?.trackingNumber;
      if (addingTracking) {
        payload.trackingNumber = trackingInput.trim();
        payload.carrier = carrier || 'Canada Post';
      }
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      setOrder(data.order);
      setSuccessMessage('Order updated successfully!');
      setComment('');
      if (addingTracking) setTrackingInput('');

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

  const hasStatusChanges = status !== order.status || paymentStatus !== order.paymentStatus;
  const addingTracking = trackingInput.trim().length > 0 && !order.trackingNumber;
  const hasChanges = hasStatusChanges || addingTracking;
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
                    {(() => {
                      const attrs = (item.selectedAttributes || {}) as Record<string, unknown>;
                      const { size: sizeStr, color: colorStr } = getSizeAndColorFromAttributes(attrs);
                      const otherEntries = Object.entries(attrs).filter(
                        ([k, v]) => v != null && v !== '' && !k.toLowerCase().includes('size') && k.toLowerCase() !== 'color' && k.toLowerCase() !== 'colour'
                      );
                      const label = (key: string) => key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim().split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                      const items: { label: string; value: string }[] = [
                        ...(sizeStr ? [{ label: 'Size', value: sizeStr }] : []),
                        ...(colorStr ? [{ label: 'Color', value: colorStr }] : []),
                        ...otherEntries.map(([k, v]) => ({ label: label(k), value: String(Array.isArray(v) ? v[0] : v) })),
                      ];
                      if (items.length === 0) return null;
                      return (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            {items.map(({ label: l, value }) => (
                              <span key={l} className="text-gray-700">
                                <span className="text-gray-500">{l}:</span>{' '}
                                <span className="font-medium text-gray-900">{value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
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
                  {/* Create Canada Post label (one-click) when no tracking yet — domestic Canada only */}
              {!order.trackingNumber && (() => {
                const isCanada = (order.shippingAddress?.country || '').toUpperCase() === 'CA' || (order.shippingAddress?.country || '').toLowerCase() === 'canada';
                return (
                <div className="p-4 rounded-lg bg-[#FDE8F0]/40 border border-[#F9629F]/30">
                  <p className="text-sm font-medium text-gray-800 mb-2">Create shipping label</p>
                  {!isCanada ? (
                    <p className="text-xs text-amber-700 mb-3">
                      Label creation is supported for Canadian addresses only. Use “Or add tracking number manually” below for other carriers or international.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 mb-3">
                      Create a Canada Post label for this order. Tracking will be saved and the order marked as shipped.
                    </p>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      setCreateLabelLoading(true);
                      setError('');
                      try {
                        const res = await fetch(`/api/admin/orders/${orderId}/create-label`, { method: 'POST' });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Failed to create label');
                        if (data.labelPdfBase64) {
                          const blob = new Blob([Uint8Array.from(atob(data.labelPdfBase64), (c) => c.charCodeAt(0))], { type: 'application/pdf' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `label-order-${orderId?.slice(-8)}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                        await fetchOrder();
                        setSuccessMessage('Label created and tracking saved.');
                        setTimeout(() => setSuccessMessage(''), 4000);
                      } catch (e: any) {
                        setError(e.message || 'Failed to create label');
                      } finally {
                        setCreateLabelLoading(false);
                      }
                    }}
                    disabled={createLabelLoading || !isCanada}
                    className="w-full"
                  >
                    {createLabelLoading ? 'Creating label…' : 'Create Canada Post label'}
                  </Button>
                </div>
                );
              })()}
              {/* Manual tracking number (e.g. other carrier or existing PIN) */}
              {!order.trackingNumber && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or add tracking number manually
                    </label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. Canada Post PIN or other carrier"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#F9629F] focus:ring-1 focus:ring-[#F9629F]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier
                    </label>
                    <Select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      options={[
                        { value: 'Canada Post', label: 'Canada Post' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                  </div>
                </>
              )}
              {hasChanges && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={addingTracking ? "e.g. Canada Post label created and shipped." : "Explain why the status is being changed..."}
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
                  {addingTracking && !hasStatusChanges ? 'Add tracking' : hasStatusChanges && !addingTracking ? 'Update order' : 'Update order & tracking'}
                </Button>
              )}
            </div>
          </div>

          {/* Package tracking: display when order has tracking */}
          {(order.trackingNumber || order.trackingStatus) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiTruck className="w-5 h-5 text-[#F9629F]" />
                Package tracking
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Carrier</p>
                  <p className="font-medium text-gray-900">{order.carrier || 'Canada Post'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tracking number</p>
                  <p className="font-mono text-sm font-medium text-gray-900 break-all">{order.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">{order.trackingStatus || '—'}</p>
                </div>
                {order.trackingUpdatedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Last updated</p>
                    <p className="text-sm text-gray-900">{formatDate(order.trackingUpdatedAt)}</p>
                  </div>
                )}
                {(order.trackingEvents?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Events</p>
                    <ul className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                      {([...(order.trackingEvents || [])].reverse() as ITrackingEvent[]).map((ev, i) => (
                        <li key={i} className="text-sm">
                          <span className="font-medium text-gray-900">{ev.description}</span>
                          <span className="text-gray-500 block">
                            {ev.date}{ev.time ? ` ${ev.time}` : ''}
                            {(ev.location || ev.province) && ` · ${[ev.location, ev.province].filter(Boolean).join(', ')}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.carrier?.toLowerCase().includes('canada post') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setRefreshTrackingLoading(true);
                      setError('');
                      try {
                        const res = await fetch(`/api/admin/orders/${orderId}/refresh-tracking`, { method: 'POST' });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || 'Refresh failed');
                        await fetchOrder();
                        setSuccessMessage('Tracking refreshed.');
                        setTimeout(() => setSuccessMessage(''), 3000);
                      } catch (e: any) {
                        setError(e.message || 'Failed to refresh tracking');
                      } finally {
                        setRefreshTrackingLoading(false);
                      }
                    }}
                    disabled={refreshTrackingLoading}
                    className="w-full"
                  >
                    <FiRefreshCw className={`w-4 h-4 mr-2 inline ${refreshTrackingLoading ? 'animate-spin' : ''}`} />
                    Refresh from Canada Post
                  </Button>
                )}
              </div>
            </div>
          )}

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
