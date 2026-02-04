'use client';

import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import ShippingAddressDisplay from '@/components/cart/ShippingAddressDisplay';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { ShippingAddress } from '@/types/address';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, getCartSummary } = useCart();
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<{ fullName: string; address: string; city: string; state: string; zipCode: string; country: string; phone: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading cart..." />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = cart?.items || [];
  const cartSummary = getCartSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-3 rounded-xl shadow-lg">
              <FiShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#050b2c]">
                Shopping Cart
              </h1>
              {items.length > 0 && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 sm:py-24"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-br from-[#050b2c] to-[#0a1538] p-8 rounded-full">
                <FiShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-[#ffa509]" />
              </div>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start shopping to add amazing products to your cart
            </p>
            <Link href="/dashboard/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-lg hover:shadow-xl px-8 py-3 text-lg font-semibold">
                  Browse Products
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-4"
            >
              {items
                .filter((item) => {
                  if (!item.product) return false;
                  if (typeof item.product === 'string') return true;
                  return item.product && item.product._id;
                })
                .map((item, index) => {
                  const productId =
                    typeof item.product === 'string'
                      ? item.product
                      : item.product?._id || '';
                  
                  if (!productId) {
                    return null;
                  }
                  
                  return (
                    <motion.div
                      key={`${productId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  );
                })}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <ShippingAddressDisplay onAddressSelect={setSelectedAddress} />
              <CartSummary selectedAddress={selectedAddress} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
