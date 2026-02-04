'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck,
  FiDownload,
  FiUser,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiShoppingBag,
  FiFilter,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import { Order } from '@/types/order';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';

interface Delivery {
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  orders: Order[];
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  totalAmount: number;
  isDeletedUser?: boolean;
}

interface DeliveriesResponse {
  deliveries: Delivery[];
  total: number;
  totalOrders: number;
  error?: string;
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/deliveries?${params.toString()}`);
      const data: DeliveriesResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch deliveries');
      }

      setDeliveries(data.deliveries || []);
      // Expand all customers by default
      const allCustomerIds = new Set((data.deliveries || []).map(d => d.customerId));
      setExpandedCustomers(allCustomerIds);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deliveries');
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomer = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!orderId) return;

    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Refresh deliveries to show updated status
      await fetchDeliveries();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const markAllOrdersAsShipped = async (orders: Order[]) => {
    const ordersToUpdate = orders.filter(
      (order) => order.status === 'pending' || order.status === 'processing'
    );

    if (ordersToUpdate.length === 0) {
      setError('No orders available to mark as shipped');
      return;
    }

    setError('');
    const orderIds = ordersToUpdate.map((order) => order._id || '').filter(Boolean);
    
    // Add all order IDs to updating set
    setUpdatingOrders((prev) => new Set([...prev, ...orderIds]));

    try {
      // Update all orders in parallel
      const updatePromises = orderIds.map((orderId) =>
        fetch(`/api/admin/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'shipped' }),
        })
      );

      const responses = await Promise.all(updatePromises);
      const results = await Promise.all(
        responses.map((res) => res.json())
      );

      const failed = results.filter((result, index) => !responses[index].ok);
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} order(s)`);
      }

      // Refresh deliveries to show updated status
      await fetchDeliveries();
    } catch (err: any) {
      setError(err.message || 'Failed to update some orders');
      console.error('Error updating orders:', err);
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        orderIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'from-green-500 to-emerald-600';
      case 'shipped':
        return 'from-blue-500 to-cyan-600';
      case 'processing':
        return 'from-purple-500 to-indigo-600';
      case 'pending':
        return 'from-yellow-500 to-orange-600';
      case 'cancelled':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const downloadDeliveryPDF = (delivery: Delivery) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Header
    doc.setFillColor(5, 11, 44); // #050b2c
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY SLIP', pageWidth / 2, 25, { align: 'center' });

    yPos = 50;

    // Customer Information Section
    doc.setTextColor(255, 165, 9); // #ffa509
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', margin, yPos);
    yPos += 10;

    doc.setTextColor(5, 11, 44);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${delivery.customerName}`, margin, yPos);
    yPos += 7;
    doc.text(`Email: ${delivery.customerEmail}`, margin, yPos);
    yPos += 7;
    doc.text(`Phone: ${delivery.shippingAddress.phone}`, margin, yPos);
    yPos += 10;

    // Delivery Address Section
    checkPageBreak(30);
    doc.setTextColor(255, 165, 9);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY ADDRESS', margin, yPos);
    yPos += 10;

    doc.setTextColor(5, 11, 44);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(delivery.shippingAddress.fullName, margin, yPos);
    yPos += 7;
    doc.text(delivery.shippingAddress.address, margin, yPos);
    yPos += 7;
    doc.text(
      `${delivery.shippingAddress.city}, ${delivery.shippingAddress.state} ${delivery.shippingAddress.zipCode}`,
      margin,
      yPos
    );
    yPos += 7;
    doc.text(delivery.shippingAddress.country, margin, yPos);
    yPos += 15;

    // Orders Section
    checkPageBreak(30);
    doc.setTextColor(255, 165, 9);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORDERS (${delivery.orders.length})`, margin, yPos);
    yPos += 10;

    delivery.orders.forEach((order, index) => {
      checkPageBreak(40);
      
      // Order Header
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(5, 11, 44);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Order #${order._id?.slice(-8).toUpperCase() || 'N/A'}`, margin + 2, yPos);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Status: ${order.status?.toUpperCase() || 'N/A'}`,
        pageWidth - margin - 50,
        yPos
      );
      yPos += 10;

      // Order Items
      order.items?.forEach((item) => {
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.text(`• ${item.name}`, margin + 5, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `  Qty: ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.quantity * item.price)}`,
          margin + 10,
          yPos
        );
        yPos += 7;
        doc.setTextColor(5, 11, 44);
      });

      // Order Total
      checkPageBreak(10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Order Total: ${formatCurrency(order.totalAmount)}`,
        pageWidth - margin - 50,
        yPos - 5
      );
      yPos += 10;

      // Order Date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${formatDate(order.createdAt)}`, margin + 5, yPos);
      yPos += 10;

      // Separator line
      if (index < delivery.orders.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }
    });

    // Total Summary
    checkPageBreak(20);
    yPos += 5;
    doc.setDrawColor(255, 165, 9);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFillColor(255, 165, 9);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `TOTAL: ${formatCurrency(delivery.totalAmount)}`,
      pageWidth / 2,
      yPos + 2,
      { align: 'center' }
    );

    // Footer
    yPos = pageHeight - 20;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`delivery-${delivery.customerName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
  };

  if (loading && deliveries.length === 0) {
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
          <p className="mt-4 text-[#050b2c] font-semibold text-lg">Loading deliveries...</p>
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
                  <FiTruck className="w-8 h-8 text-white" />
                </motion.div>
                Deliveries
              </h1>
              <p className="text-white/80 text-lg">
                Manage customer deliveries and generate delivery slips for drivers
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiUser className="w-5 h-5 text-[#ffa509]" />
                  <div>
                    <p className="text-xs text-white/70">Customers</p>
                    <p className="text-xl font-bold">{deliveries.length}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiPackage className="w-5 h-5 text-[#ffa509]" />
                  <div>
                    <p className="text-xs text-white/70">Total Orders</p>
                    <p className="text-xl font-bold">{deliveries.reduce((sum, d) => sum + d.totalOrders, 0)}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

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
            <h2 className="text-xl font-bold text-[#050b2c]">Filter Deliveries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={fetchDeliveries}
                className="mt-7 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#ffa509] to-[#ff8c00] rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
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
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800"
        >
          {error}
        </motion.div>
      )}

      {/* Deliveries Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {deliveries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#ffa509]/20 p-12 text-center"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <FiTruck className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-[#050b2c] mb-2">No Deliveries Found</h3>
            <p className="text-gray-600">
              {statusFilter
                ? 'No deliveries match the selected filter'
                : 'All orders have been delivered'}
            </p>
          </motion.div>
        ) : (
          deliveries.map((delivery, index) => {
            const isExpanded = expandedCustomers.has(delivery.customerId);
            return (
              <motion.div
                key={delivery.customerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 hover:border-[#ffa509] transition-all overflow-hidden group"
              >
                {/* Customer Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleCustomer(delivery.customerId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Customer Info */}
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                          <FiUser className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Customer</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-[#050b2c]">{delivery.customerName}</p>
                            {delivery.isDeletedUser && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                                Deleted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {delivery.customerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                          <FiMapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Delivery Address</p>
                          <p className="text-sm font-bold text-[#050b2c]">
                            {delivery.shippingAddress.city}, {delivery.shippingAddress.state}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {delivery.shippingAddress.address}
                          </p>
                        </div>
                      </div>

                      {/* Orders Count */}
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                          <FiPackage className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Orders</p>
                          <p className="text-lg font-bold text-[#050b2c]">{delivery.totalOrders}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-semibold ${delivery.pendingOrders > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              {delivery.pendingOrders} pending
                            </span>
                            {delivery.shippedOrders > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-blue-600 font-semibold">
                                  {delivery.shippedOrders} shipped
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-[#ffa509]/20 to-[#ff8c00]/20 rounded-xl">
                          <FiDollarSign className="w-6 h-6 text-[#ffa509]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Total Value</p>
                          <p className="text-lg font-bold text-[#050b2c]">
                            {formatCurrency(delivery.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {delivery.orders.some(
                        (order) => order.status === 'pending' || order.status === 'processing'
                      ) && !delivery.isDeletedUser && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllOrdersAsShipped(delivery.orders);
                          }}
                          disabled={delivery.orders.some((order) =>
                            updatingOrders.has(order._id || '')
                          )}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                            delivery.orders.some((order) => updatingOrders.has(order._id || ''))
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                          }`}
                          title="Mark all orders as shipped"
                        >
                          {delivery.orders.some((order) => updatingOrders.has(order._id || '')) ? (
                            <>
                              <FiLoader className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-4 h-4" />
                              Mark All Shipped
                            </>
                          )}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDeliveryPDF(delivery);
                        }}
                        className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
                        title="Download PDF"
                      >
                        <FiDownload className="w-5 h-5" />
                      </motion.button>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-3 bg-gray-100 rounded-xl text-[#050b2c] cursor-pointer"
                      >
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5" />
                        ) : (
                          <FiChevronDown className="w-5 h-5" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded Orders List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t-2 border-gray-200 bg-gray-50"
                    >
                      <div className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-[#050b2c] flex items-center gap-2">
                          <FiShoppingBag className="w-5 h-5 text-[#ffa509]" />
                          Orders Details
                        </h3>
                        {delivery.orders.map((order) => {
                          const isUpdating = updatingOrders.has(order._id || '');
                          const canShip = order.status === 'pending' || order.status === 'processing';
                          return (
                            <motion.div
                              key={order._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#ffa509] transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-sm font-bold text-[#050b2c]">
                                    Order #{order._id?.slice(-8).toUpperCase()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(order.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(order.status)} text-white text-xs font-semibold`}>
                                    {order.status?.toUpperCase() || 'N/A'}
                                  </div>
                                  {canShip && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order._id || '', 'shipped');
                                      }}
                                      disabled={isUpdating}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all ${
                                        isUpdating
                                          ? 'bg-gray-400 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                                      }`}
                                    >
                                      {isUpdating ? (
                                        <>
                                          <FiLoader className="w-3 h-3 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        <>
                                          <FiCheckCircle className="w-3 h-3" />
                                          Mark Shipped
                                        </>
                                      )}
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-[#050b2c]">
                                      {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-semibold text-[#050b2c]">
                                      {formatCurrency(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                  <span className="font-bold text-[#050b2c]">Order Total:</span>
                                  <span className="font-bold text-lg text-[#ffa509]">
                                    {formatCurrency(order.totalAmount)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
