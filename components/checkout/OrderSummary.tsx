'use client';

import { ICartItem } from '@/types/cart';
import Link from 'next/link';
import ProductImage from '@/components/products/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiTag, FiX, FiCheck, FiHelpCircle } from 'react-icons/fi';
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';

interface OrderSummaryProps {
  items: ICartItem[];
  subtotal: number;
  shipping?: number;
  shippingLoading?: boolean;
  tax?: number;
  total: number;
  paymentMethod?: 'card' | 'afterpay' | 'klarna' | 'affirm';
  onCouponApplied?: (discount: number, couponCode?: string, couponType?: 'percentage' | 'fixed') => void;
  /** When true, hide the "Order Summary" header (e.g. when used inside a collapsible that has its own header) */
  compact?: boolean;
}

// Mock coupon codes - In production, this would come from an API
const COUPON_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE10': { discount: 10, type: 'fixed' },
  'FLASH10': { discount: 10, type: 'fixed' },
  'NEWUSER10': { discount: 10, type: 'fixed' },
  'SAVE50': { discount: 50, type: 'fixed' },
  'WELCOME10': { discount: 10, type: 'fixed' },
};

export default function OrderSummary({
  items,
  subtotal,
  shipping = 0,
  shippingLoading = false,
  tax = 0,
  total,
  paymentMethod = 'card',
  onCouponApplied,
  compact = false,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showShippingInfo, setShowShippingInfo] = useState(false);

  const calculateDiscount = (coupon: { discount: number; type: 'percentage' | 'fixed' } | null): number => {
    if (!coupon) return 0;
    
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100;
    } else {
      return Math.min(coupon.discount, subtotal); // Don't discount more than subtotal
    }
  };

  const handleApplyCoupon = async () => {
    // Prevent applying a coupon if one is already applied
    if (appliedCoupon) {
      setCouponError('A coupon has already been applied. Please remove it first to apply another.');
      return;
    }

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setCouponError(null);

    try {
      const code = couponCode.trim().toUpperCase();
      
      // Validate coupon with API
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || 'Failed to validate coupon');
        setIsApplying(false);
        return;
      }

      if (data.valid && data.coupon) {
        const newCoupon = {
          code: data.coupon.code,
          discount: data.coupon.discount,
          type: data.coupon.type,
        };
        setAppliedCoupon(newCoupon);
        setCouponCode('');
        const discount = calculateDiscount(newCoupon);
        if (onCouponApplied) {
          onCouponApplied(discount, newCoupon.code, newCoupon.type);
        }
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    if (onCouponApplied) {
      onCouponApplied(0, undefined, undefined);
    }
  };

  const discount = calculateDiscount(appliedCoupon);
  const subtotalAfterDiscount = subtotal - discount;

  // Tax is shouldered by owner/admin, so set to 0 for customers
  const taxBreakdown = {
    subtotal: subtotalAfterDiscount,
    gst: 0,
    pst: 0,
    totalTax: 0,
    total: subtotalAfterDiscount,
  };
  const finalTotal = Math.max(0, subtotalAfterDiscount + shipping + taxBreakdown.totalTax);
  
  return (
    <motion.div
      initial={compact ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-[#000000] to-[#1a1a1a] ${compact ? 'rounded-none shadow-none border-0 p-4 sm:p-6 md:p-8 pt-2 sm:pt-4' : 'rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:sticky lg:top-6 border border-white/10'}`}
    >
      {!compact && (
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-[#F9629F] to-[#DB7093] p-1.5 sm:p-2 rounded-lg flex-shrink-0">
            <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">Order Summary</h2>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-[280px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
        {items.map((item, index) => {
          const product = typeof item.product === 'object' ? item.product : null;
          const productId = typeof item.product === 'string' ? item.product : product?._id || '';
          const productName = product?.name || 'Product';
          const productPrice = product?.price || 0;
          const itemTotal = productPrice * item.quantity;
          const imageUrl = product?.coverImage || (product?.images && product.images[0]) || '';

          return (
            <motion.div
              key={productId || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-3 bg-white/5 rounded-xl p-3 border border-white/10"
            >
              {/* Product Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                {imageUrl && !imageUrl.includes('example.com') && !imageUrl.startsWith('http://localhost') ? (
                  <ProductImage
                    product={product || {} as any}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiPackage className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1 line-clamp-2">
                  {productName}
                </h3>
                <p className="text-xs text-white/70 mb-1">
                  Qty: <span className="font-semibold text-white">{item.quantity}</span>
                </p>
                <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent">
                  {formatCurrency(itemTotal)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Coupon Code Section */}
      <div className="border-t border-white/20 pt-4 mb-4">
        {!appliedCoupon ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FiTag className="w-4 h-4 text-[#F9629F]" />
              <label className="text-sm font-semibold text-white">Have a coupon code?</label>
            </div>
            <div className="flex gap-2 min-w-0">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                placeholder="Enter code"
                className="flex-1 min-w-0 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                className="flex-shrink-0 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
              >
                {isApplying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Apply'
                )}
              </motion.button>
            </div>
            {couponError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs font-medium"
              >
                {couponError}
              </motion.p>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[#F9629F]/20 to-[#DB7093]/20 border-2 border-[#F9629F]/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-[#F9629F] to-[#DB7093] p-1.5 rounded-lg">
                  <FiCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">{appliedCoupon.code}</p>
                  <p className="text-white/70 text-xs">
                    {appliedCoupon.type === 'percentage' 
                      ? `${appliedCoupon.discount}% off` 
                      : `$${appliedCoupon.discount} off`}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemoveCoupon}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Remove coupon"
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary Totals */}
      <div className="border-t border-white/20 pt-4 space-y-3">
        <div className="flex justify-between items-center text-white/90">
          <span className="text-sm sm:text-base">Subtotal</span>
          <span className="font-semibold text-lg">{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center text-[#F9629F]"
          >
            <span className="text-sm sm:text-base font-semibold flex items-center gap-1">
              <FiTag className="w-4 h-4" />
              Discount ({appliedCoupon?.code})
            </span>
            <span className="font-bold text-lg">-{formatCurrency(discount)}</span>
          </motion.div>
        )}

        <div className="relative flex justify-between items-center text-white/70">
          <span className="text-sm sm:text-base flex items-center gap-1.5">
            Shipping
            <button
              type="button"
              onClick={() => setShowShippingInfo((v) => !v)}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 text-white/90 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9629F]"
              aria-label="Shipping information"
            >
              <FiHelpCircle className="w-3.5 h-3.5" />
            </button>
          </span>
          <span className="text-sm">
            {shippingLoading ? 'Calculating...' : shipping > 0 ? formatCurrency(shipping) : 'Free'}
          </span>
          <AnimatePresence>
            {showShippingInfo && (
              <>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={() => setShowShippingInfo(false)}
                  className="fixed inset-0 z-[100] bg-black/60 sm:hidden"
                  aria-label="Close shipping info"
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-4 right-4 top-1/2 -translate-y-1/2 sm:absolute sm:left-0 sm:right-0 sm:top-full sm:mt-2 sm:translate-y-0 sm:w-80 z-[110] p-5 sm:p-4 bg-[#0d0d0d] border-2 border-white/30 rounded-xl shadow-2xl text-left"
                >
                  <p className="font-bold text-white text-lg sm:text-sm mb-3">Shipping &amp; delivery</p>
                  <ul className="space-y-2.5 sm:space-y-1.5 text-white/95 text-base sm:text-sm leading-relaxed sm:leading-normal">
                    <li className="flex items-start gap-2">
                      <span className="text-[#F9629F] mt-0.5">•</span>
                      <span>Ships from Victoria, BC (Canada-wide)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F9629F] mt-0.5">•</span>
                      <span>1–3 business days processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F9629F] mt-0.5">•</span>
                      <span>Canada Post with tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F9629F] mt-0.5">•</span>
                      <span>$100 complimentary insurance</span>
                    </li>
                  </ul>
                  <Link
                    href="/shipping"
                    className="inline-flex items-center gap-1.5 mt-4 py-3 px-5 sm:py-2.5 sm:px-4 rounded-lg bg-[#F9629F]/20 text-[#F9629F] font-semibold text-base sm:text-sm hover:bg-[#F9629F]/30 transition-colors min-h-[44px] sm:min-h-0 items-center justify-center"
                  >
                    View full shipping info →
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        
        <div className="border-t border-white/20 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <motion.span
              key={finalTotal}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent"
            >
              {formatCurrency(finalTotal)}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
