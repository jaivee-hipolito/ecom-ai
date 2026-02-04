'use client';

import { ICartItem } from '@/types/cart';
import Image from 'next/image';
import ProductImage from '@/components/products/ProductImage';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { useState } from 'react';
import { calculateBCTax } from '@/utils/tax';

interface OrderSummaryProps {
  items: ICartItem[];
  subtotal: number;
  shipping?: number;
  tax?: number;
  total: number;
  onCouponApplied?: (discount: number) => void;
}

// Format currency with commas
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Mock coupon codes - In production, this would come from an API
const COUPON_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
  'SAVE20': { discount: 20, type: 'percentage' },
  'FLASH30': { discount: 30, type: 'percentage' },
  'NEWUSER15': { discount: 15, type: 'percentage' },
  'SAVE50': { discount: 50, type: 'fixed' },
  'WELCOME10': { discount: 10, type: 'percentage' },
};

export default function OrderSummary({
  items,
  subtotal,
  shipping = 0,
  tax = 0,
  total,
  onCouponApplied,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const calculateDiscount = (coupon: { discount: number; type: 'percentage' | 'fixed' } | null): number => {
    if (!coupon) return 0;
    
    if (coupon.type === 'percentage') {
      return (subtotal * coupon.discount) / 100;
    } else {
      return Math.min(coupon.discount, subtotal); // Don't discount more than subtotal
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplying(true);
    setCouponError(null);

    // Simulate API call
    setTimeout(() => {
      const code = couponCode.trim().toUpperCase();
      const coupon = COUPON_CODES[code];

      if (coupon) {
        const newCoupon = { code, ...coupon };
        setAppliedCoupon(newCoupon);
        setCouponCode('');
        const discount = calculateDiscount(newCoupon);
        if (onCouponApplied) {
          onCouponApplied(discount);
        }
      } else {
        setCouponError('Invalid coupon code');
      }
      setIsApplying(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    if (onCouponApplied) {
      onCouponApplied(0);
    }
  };

  const discount = calculateDiscount(appliedCoupon);
  const subtotalAfterDiscount = subtotal - discount;
  const taxBreakdown = calculateBCTax(subtotalAfterDiscount);
  const finalTotal = Math.max(0, subtotalAfterDiscount + shipping + taxBreakdown.totalTax);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#050b2c] to-[#0a1538] rounded-2xl shadow-2xl p-6 sm:p-8 sticky top-8 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
          <FiShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Order Summary</h2>
      </div>

      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
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
                <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent">
                  ${formatCurrency(itemTotal)}
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
              <FiTag className="w-4 h-4 text-[#ffa509]" />
              <label className="text-sm font-semibold text-white">Have a coupon code?</label>
            </div>
            <div className="flex gap-2">
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
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
            className="bg-gradient-to-r from-[#ffa509]/20 to-[#ff8c00]/20 border-2 border-[#ffa509]/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-1.5 rounded-lg">
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
          <span className="font-semibold text-lg">${formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-between items-center text-[#ffa509]"
          >
            <span className="text-sm sm:text-base font-semibold flex items-center gap-1">
              <FiTag className="w-4 h-4" />
              Discount ({appliedCoupon?.code})
            </span>
            <span className="font-bold text-lg">-${formatCurrency(discount)}</span>
          </motion.div>
        )}
        
        {shipping > 0 && (
          <div className="flex justify-between items-center text-white/70">
            <span className="text-sm sm:text-base">Shipping</span>
            <span className="text-sm">${formatCurrency(shipping)}</span>
          </div>
        )}
        
        {taxBreakdown.totalTax > 0 && (
          <>
            <div className="flex justify-between items-center text-white/70">
              <span className="text-sm sm:text-base">GST (5%)</span>
              <span className="text-sm">${formatCurrency(taxBreakdown.gst)}</span>
            </div>
          <div className="flex justify-between items-center text-white/70">
              <span className="text-sm sm:text-base">PST (7%)</span>
              <span className="text-sm">${formatCurrency(taxBreakdown.pst)}</span>
            </div>
            <div className="flex justify-between items-center text-white/90 font-semibold border-t border-white/10 pt-2">
              <span className="text-sm sm:text-base">Total Tax</span>
              <span className="text-base">${formatCurrency(taxBreakdown.totalTax)}</span>
          </div>
          </>
        )}
        
        <div className="border-t border-white/20 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <motion.span
              key={finalTotal}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent"
            >
              ${formatCurrency(finalTotal)}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
