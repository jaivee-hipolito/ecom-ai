'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShippingAddress } from '@/types/address';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

interface CartSummaryProps {
  selectedAddress?: ShippingAddress | null;
  selectedItemIds?: Set<string>;
}

export default function CartSummary({ selectedAddress, selectedItemIds }: CartSummaryProps) {
  const { cart, getCartSummary } = useCart();
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Calculate summary based on selected items only
  const calculateSelectedSummary = () => {
    if (!cart || !cart.items) {
      return { totalItems: 0, totalPrice: 0 };
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach((item) => {
      const productId = typeof item.product === 'string' ? item.product : item.product?._id || '';
      
      // Only include selected items
      if (selectedItemIds && !selectedItemIds.has(productId)) {
        return;
      }

      const product = typeof item.product === 'object' ? item.product : ({} as any);
      const price = product.price || 0;
      const quantity = item.quantity || 0;

      totalItems += quantity;
      totalPrice += price * quantity;
    });

    return { totalItems, totalPrice };
  };

  // Use selected items summary if selectedItemIds is provided, otherwise use full cart summary
  const summary = selectedItemIds !== undefined 
    ? calculateSelectedSummary() 
    : getCartSummary();

  const handleProceedToCheckout = () => {
    const params = new URLSearchParams();
    
    // Add selected item IDs to URL params
    if (selectedItemIds && selectedItemIds.size > 0) {
      selectedItemIds.forEach((id) => {
        params.append('items', id);
      });
    }
    
    if (selectedAddress) {
      // Encode address as URL params
      params.set('addressId', 'selected');
      params.set('fullName', selectedAddress.fullName);
      params.set('address', selectedAddress.address);
      params.set('city', selectedAddress.city);
      params.set('state', selectedAddress.state);
      params.set('zipCode', selectedAddress.zipCode);
      params.set('country', selectedAddress.country);
      params.set('phone', selectedAddress.phone);
    }
    
    const queryString = params.toString();
    router.push(queryString ? `/checkout?${queryString}` : '/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#050b2c] to-[#0a1538] rounded-2xl shadow-2xl p-6 sm:p-8 sticky top-8 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
          <FiShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Order Summary</h2>
      </div>

      {/* Summary Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-white/90">
          <span className="text-sm sm:text-base">Subtotal ({summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'})</span>
          <span className="font-semibold text-lg">{formatCurrency(summary.totalPrice)}</span>
        </div>
        
        <div className="text-sm sm:text-base text-white/70 italic">
          * Tax included
        </div>
        
        <div className="flex flex-col gap-1 text-white/70">
          <div className="flex items-center gap-2">
            <FiTruck className="w-4 h-4 flex-shrink-0 text-[#ffa509]" />
            <span className="text-sm sm:text-base font-medium">Shipping</span>
          </div>
          <span className="text-xs sm:text-sm text-white/60 pl-6">
            Calculated at checkout
          </span>
        </div>
        
        <div className="border-t border-white/20 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent"
            >
              {formatCurrency(summary.totalPrice)}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <FiShield className="w-4 h-4 text-[#ffa509]" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-2 text-white/70 text-xs">
          <FiTruck className="w-4 h-4 text-[#ffa509]" />
          <span>Free Shipping around Victoria</span>
        </div>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-white/30 bg-transparent text-[#ffa509] focus:ring-2 focus:ring-[#ffa509] focus:ring-offset-2 focus:ring-offset-[#050b2c] cursor-pointer accent-[#ffa509]"
            required
          />
          <span className="text-sm sm:text-base text-white/80 group-hover:text-white transition-colors">
            I have read and agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              className="text-[#ffa509] hover:text-[#ff8c00] underline font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Terms & Conditions
            </Link>
            {' '}of Teezee
          </span>
        </label>
      </div>

      {/* Checkout Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={handleProceedToCheckout}
          disabled={summary.totalItems === 0 || !selectedAddress || (selectedItemIds !== undefined && selectedItemIds.size === 0) || !termsAccepted}
          className="w-full bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-xl hover:shadow-2xl py-4 px-6 text-lg font-bold transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <FiArrowRight className="w-5 h-5 flex-shrink-0" />
        </button>
      </motion.div>
      
      {(!selectedAddress || !termsAccepted) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#ffa509] mt-3 text-center font-medium"
        >
          {!selectedAddress && '⚠️ Please select a shipping address above'}
          {!selectedAddress && !termsAccepted && ' • '}
          {!termsAccepted && '⚠️ Please accept the Terms & Conditions'}
        </motion.p>
      )}

      {/* Continue Shopping */}
      <Link href="/dashboard/products" className="block mt-4">
        <motion.div
          whileHover={{ x: 5 }}
          className="text-center text-white/70 hover:text-[#ffa509] transition-colors text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <FiArrowRight className="w-4 h-4" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
