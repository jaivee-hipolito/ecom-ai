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
  FiList,
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
  const [selectedForPDF, setSelectedForPDF] = useState<Set<string>>(new Set());

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
      // Keep order details collapsed by default (do not expand all)
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

    // Header (no fill - save ink)
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY SLIP', pageWidth / 2, 20, { align: 'center' });

    yPos = 36;

    // Customer Information Section
    doc.setTextColor(233, 27, 140); // #F9629F
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', margin, yPos);
    yPos += 10;

    doc.setTextColor(26, 26, 26);
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
    doc.setTextColor(233, 27, 140);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY ADDRESS', margin, yPos);
    yPos += 10;

    doc.setTextColor(26, 26, 26);
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
    doc.setTextColor(233, 27, 140);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`ORDERS (${delivery.orders.length})`, margin, yPos);
    yPos += 10;

    delivery.orders.forEach((order, index) => {
      checkPageBreak(40);

      // Order Header (no fill - save ink)
      doc.setTextColor(26, 26, 26);
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
        doc.setTextColor(26, 26, 26);
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

    // Total Summary (no fill - save ink)
    checkPageBreak(20);
    yPos += 5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `TOTAL: ${formatCurrency(delivery.totalAmount)}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 8;

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

  const toggleSelectedForPDF = (customerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForPDF((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  };

  const selectAllForPDF = () => {
    setSelectedForPDF(new Set(deliveries.map((d) => d.customerId)));
  };

  const deselectAllForPDF = () => {
    setSelectedForPDF(new Set());
  };

  const downloadSelectedDeliveriesPDF = () => {
    const toExport = deliveries.filter((d) => selectedForPDF.has(d.customerId));
    if (toExport.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Title (no fill - save ink)
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERIES LIST', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated ${new Date().toLocaleString()} • ${toExport.length} delivery${toExport.length !== 1 ? 'ies' : ''}`, pageWidth / 2, 28, { align: 'center' });
    yPos = 40;

    toExport.forEach((delivery, deliveryIndex) => {
      checkPageBreak(80);

      // Section header for this delivery
      doc.setTextColor(233, 27, 140); // #F9629F
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `DELIVERY ${deliveryIndex + 1} OF ${toExport.length} — ${delivery.customerName}`,
        margin,
        yPos
      );
      yPos += 10;

      // Customer info
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${delivery.customerName}`, margin, yPos);
      yPos += 6;
      doc.text(`Email: ${delivery.customerEmail}`, margin, yPos);
      yPos += 6;
      doc.text(`Phone: ${delivery.shippingAddress.phone}`, margin, yPos);
      yPos += 8;

      // Address
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Address:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(delivery.shippingAddress.fullName, margin, yPos);
      yPos += 6;
      doc.text(delivery.shippingAddress.address, margin, yPos);
      yPos += 6;
      doc.text(
        `${delivery.shippingAddress.city}, ${delivery.shippingAddress.state} ${delivery.shippingAddress.zipCode}`,
        margin,
        yPos
      );
      yPos += 6;
      doc.text(delivery.shippingAddress.country, margin, yPos);
      yPos += 10;

      doc.setTextColor(26, 26, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Orders (${delivery.orders.length})`, margin, yPos);
      yPos += 8;

      delivery.orders.forEach((order, orderIndex) => {
        checkPageBreak(35);

        // Order row (no fill - save ink)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text(`Order #${order._id?.slice(-8).toUpperCase() || 'N/A'}`, margin + 2, yPos + 1);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Status: ${order.status?.toUpperCase() || 'N/A'}`, pageWidth - margin - 45, yPos + 1);
        yPos += 9;

        order.items?.forEach((item) => {
          checkPageBreak(12);
          doc.setFontSize(9);
          doc.text(`• ${item.name} × ${item.quantity}`, margin + 4, yPos);
          yPos += 5;
          doc.setTextColor(100, 100, 100);
          doc.text(
            `  ${formatCurrency(item.price)} each = ${formatCurrency(item.quantity * item.price)}`,
            margin + 8,
            yPos
          );
          yPos += 6;
          doc.setTextColor(26, 26, 26);
        });

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Order total: ${formatCurrency(order.totalAmount)}`, pageWidth - margin - 55, yPos - 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${formatDate(order.createdAt)}`, margin + 4, yPos);
        yPos += 8;
        doc.setTextColor(26, 26, 26);

        if (orderIndex < delivery.orders.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 6;
        }
      });

      // Delivery total (no fill - save ink)
      checkPageBreak(14);
      yPos += 4;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Delivery total: ${formatCurrency(delivery.totalAmount)}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 12;

      // Separator between deliveries
      if (deliveryIndex < toExport.length - 1) {
        checkPageBreak(20);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      }
    });

    // Footer on last page (getNumberOfPages exists on jsPDF at runtime; types may be outdated)
    const totalPages = (doc as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${p} of ${totalPages} • Generated ${new Date().toLocaleString()}`,
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
    }

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${mm}-${dd}-${yyyy}`;
    const customerCount = toExport.length;
    const itemCount = toExport.reduce((sum, d) => sum + d.totalOrders, 0);
    doc.save(`deliveries-list-${dateStr}-c${customerCount}-i${itemCount}.pdf`);
  };

  if (loading && deliveries.length === 0) {
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
          <p className="mt-3 sm:mt-4 text-[#000000] font-semibold text-sm sm:text-lg">Loading deliveries...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#1a1a2e] to-[#050b2c] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.12),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                >
                  <FiTruck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                Deliveries
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg">
                Manage customer deliveries and generate delivery slips for drivers
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffa509]" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70">Customers</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold tabular-nums">{deliveries.length}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffa509]" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-white/70">Total Orders</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold tabular-nums">{deliveries.reduce((sum, d) => sum + d.totalOrders, 0)}</p>
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg flex-shrink-0">
                <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#000000]">Filter Deliveries</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.01 }} className="flex-1 sm:flex-initial min-w-0">
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
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={fetchDeliveries}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#F9629F] to-[#DB7093] rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <FiRefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Refresh
                </button>
              </motion.div>
            </div>
          </div>

          {/* Download list PDF: select all / deselect all / download selected */}
          {deliveries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600 mr-1">Include in PDF:</span>
              <button
                type="button"
                onClick={selectAllForPDF}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#050b2c] bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={deselectAllForPDF}
                className="px-2.5 py-1.5 text-xs font-semibold text-[#050b2c] bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all"
              >
                Deselect all
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadSelectedDeliveriesPDF}
                disabled={deliveries.filter((d) => selectedForPDF.has(d.customerId)).length === 0}
                className="px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#050b2c] to-[#1a1a2e] rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-[#ffa509]/30"
              >
                <FiList className="w-4 h-4" />
                Download list PDF ({deliveries.filter((d) => selectedForPDF.has(d.customerId)).length} selected)
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-red-800 text-sm sm:text-base"
        >
          {error}
        </motion.div>
      )}

      {/* Deliveries Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 sm:space-y-3 md:space-y-4"
      >
        {deliveries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-8 sm:p-10 md:p-12 text-center"
          >
            <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 sm:mb-4">
              <FiTruck className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#000000] mb-2">No Deliveries Found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-2">
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
                transition={{ delay: index * 0.03 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-xl border-2 border-gray-200 hover:border-[#F9629F] transition-all overflow-hidden group"
              >
                {/* Customer Header - compact grid */}
                <div
                  className="p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer"
                  onClick={() => toggleCustomer(delivery.customerId)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    {/* Checkbox: include this delivery in list PDF */}
                    <div
                      className="flex items-center flex-shrink-0 lg:order-first"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedForPDF.has(delivery.customerId)}
                          onChange={() => setSelectedForPDF((prev) => {
                            const next = new Set(prev);
                            if (next.has(delivery.customerId)) next.delete(delivery.customerId);
                            else next.add(delivery.customerId);
                            return next;
                          })}
                          className="w-4 h-4 rounded border-2 border-gray-300 text-[#F9629F] focus:ring-[#F9629F] cursor-pointer"
                        />
                        <span className="ml-2 text-xs font-semibold text-gray-600 hidden sm:inline">Include in PDF</span>
                      </label>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 min-w-0">
                      {/* Customer Info */}
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg sm:rounded-xl flex-shrink-0">
                          <FiUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Customer</p>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <p className="text-sm sm:text-base md:text-lg font-bold text-[#000000] truncate">{delivery.customerName}</p>
                            {delivery.isDeletedUser && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold rounded-md shrink-0">
                                Deleted
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate flex items-center gap-1">
                            <FiMail className="w-3 h-3 flex-shrink-0" />
                            {delivery.customerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg sm:rounded-xl flex-shrink-0">
                          <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Delivery Address</p>
                          <p className="text-xs sm:text-sm font-bold text-[#000000]">
                            {delivery.shippingAddress.city}, {delivery.shippingAddress.state}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-full">
                            {delivery.shippingAddress.address}
                          </p>
                        </div>
                      </div>

                      {/* Orders Count */}
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg sm:rounded-xl flex-shrink-0">
                          <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Orders</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-[#000000] tabular-nums">{delivery.totalOrders}</p>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
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
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-[#F9629F]/20 to-[#DB7093]/20 rounded-lg sm:rounded-xl flex-shrink-0">
                          <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#F9629F]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-600">Total Value</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold text-[#000000] tabular-nums">
                            {formatCurrency(delivery.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0 lg:ml-3">
                      {delivery.orders.some(
                        (order) => order.status === 'pending' || order.status === 'processing'
                      ) && !delivery.isDeletedUser && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllOrdersAsShipped(delivery.orders);
                          }}
                          disabled={delivery.orders.some((order) =>
                            updatingOrders.has(order._id || '')
                          )}
                          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 sm:gap-2 ${
                            delivery.orders.some((order) => updatingOrders.has(order._id || ''))
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                          }`}
                          title="Mark all orders as shipped"
                        >
                          {delivery.orders.some((order) => updatingOrders.has(order._id || '')) ? (
                            <>
                              <FiLoader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>Mark All Shipped</span>
                            </>
                          )}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadDeliveryPDF(delivery);
                        }}
                        className="p-2 sm:p-3 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg sm:rounded-xl text-white shadow-md hover:shadow-lg transition-all flex-shrink-0"
                        title="Download PDF"
                      >
                        <FiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.button>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl text-[#000000] cursor-pointer flex-shrink-0"
                      >
                        {isExpanded ? (
                          <FiChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <FiChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded Orders List - compact */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t-2 border-gray-200 bg-gray-50/80"
                    >
                      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#000000] flex items-center gap-1.5 sm:gap-2">
                          <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F]" />
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
                              className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200 hover:border-[#F9629F] transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-[#000000] tabular-nums">
                                    Order #{order._id?.slice(-8).toUpperCase()}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500">
                                    {formatDate(order.createdAt)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg bg-gradient-to-r ${getStatusColor(order.status)} text-white text-[10px] sm:text-xs font-semibold`}>
                                    {order.status?.toUpperCase() || 'N/A'}
                                  </div>
                                  {canShip && (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order._id || '', 'shipped');
                                      }}
                                      disabled={isUpdating}
                                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold text-white flex items-center gap-1 transition-all ${
                                        isUpdating
                                          ? 'bg-gray-400 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-md hover:shadow-lg'
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
                              <div className="space-y-1.5 sm:space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm gap-2">
                                    <span className="text-[#000000] truncate min-w-0">
                                      {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-semibold text-[#000000] tabular-nums flex-shrink-0">
                                      {formatCurrency(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                <div className="pt-1.5 sm:pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-[#000000]">Order Total:</span>
                                  <span className="font-bold text-sm sm:text-base md:text-lg text-[#F9629F] tabular-nums">
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
