'use client';

import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShippingAddress } from '@/types/address';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';

interface CartSummaryProps {
  selectedAddress?: ShippingAddress | null;
}

// Format currency with commas
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function CartSummary({ selectedAddress }: CartSummaryProps) {
  const { getCartSummary } = useCart();
  const router = useRouter();
  const summary = getCartSummary();

  const handleProceedToCheckout = () => {
    if (selectedAddress) {
      // Encode address as URL params
      const params = new URLSearchParams({
        addressId: 'selected',
        fullName: selectedAddress.fullName,
        address: selectedAddress.address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country,
        phone: selectedAddress.phone,
      });
      router.push(`/checkout?${params.toString()}`);
    } else {
      router.push('/checkout');
    }
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
          <span className="font-semibold text-lg">${formatCurrency(summary.totalPrice)}</span>
        </div>
        
        <div className="flex justify-between items-center text-white/70">
          <span className="text-sm sm:text-base flex items-center gap-2">
            <FiTruck className="w-4 h-4" />
            Shipping
          </span>
          <span className="text-sm">Calculated at checkout</span>
        </div>
        
        <div className="border-t border-white/20 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent"
            >
              ${formatCurrency(summary.totalPrice)}
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
          <span>Free Shipping</span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={handleProceedToCheckout}
          disabled={summary.totalItems === 0 || !selectedAddress}
          className="w-full bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-xl hover:shadow-2xl py-4 px-6 text-lg font-bold transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Proceed to Checkout</span>
          <FiArrowRight className="w-5 h-5 flex-shrink-0" />
        </button>
      </motion.div>
      
      {!selectedAddress && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#ffa509] mt-3 text-center font-medium"
        >
          ⚠️ Please select a shipping address above
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
