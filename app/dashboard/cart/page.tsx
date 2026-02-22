'use client';

import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import ShippingAddressDisplay from '@/components/cart/ShippingAddressDisplay';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { ShippingAddress } from '@/types/address';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';

function CartPageContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, getCartSummary } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAddress, setSelectedAddress] = useState<{ fullName: string; address: string; city: string; state: string; zipCode: string; country: string; phone: string } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize selected items from URL params or all items when cart loads
  useEffect(() => {
    if (cart?.items && selectedItems.size === 0) {
      // Check if items are specified in URL params (from checkout back button)
      const itemsFromUrl = searchParams?.getAll('items') || [];
      
      if (itemsFromUrl.length > 0) {
        // Restore selection from URL params
        const urlItemIds = new Set<string>(itemsFromUrl);
        setSelectedItems(urlItemIds);
      } else {
        // Initialize all items as selected
        const allItemIds = new Set<string>();
        cart.items.forEach((item) => {
          const productId = typeof item.product === 'string' ? item.product : item.product?._id || '';
          if (productId) {
            allItemIds.add(productId);
          }
        });
        setSelectedItems(allItemIds);
      }
    }
  }, [cart?.items, selectedItems.size, searchParams]);

  const toggleItemSelection = (productId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

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
  
  // Calculate selected items summary
  const selectedItemsSummary = (() => {
    if (!cart || !cart.items || selectedItems.size === 0) {
      return { totalItems: 0, totalPrice: 0 };
    }
    
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.items.forEach((item) => {
      const productId = typeof item.product === 'string' ? item.product : item.product?._id || '';
      if (selectedItems.has(productId)) {
        const product = typeof item.product === 'object' ? item.product : ({} as any);
        const price = product.price || 0;
        const quantity = item.quantity || 0;
        totalItems += quantity;
        totalPrice += price * quantity;
      }
    });
    
    return { totalItems, totalPrice };
  })();

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
            <div className="bg-[#FDE8F0] border border-gray-300 p-3 rounded-xl shadow-lg">
              <FiShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-[#1a1a1a]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#000000]">
                Shopping Cart
              </h1>
              {items.length > 0 && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {selectedItems.size > 0 ? (
                    <>
                      {selectedItemsSummary.totalItems} {selectedItemsSummary.totalItems === 1 ? 'item' : 'items'} selected
                      {selectedItems.size < items.length && (
                        <span className="text-gray-500"> • {items.length} total in cart</span>
                      )}
                    </>
                  ) : (
                    <>
                      {cartSummary.totalItems} {cartSummary.totalItems === 1 ? 'item' : 'items'} in your cart
                    </>
                  )}
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
              <div className="bg-[#FDE8F0] border border-gray-300 p-8 rounded-full">
                <FiShoppingCart className="w-16 h-16 sm:w-20 sm:h-20 text-[#1a1a1a]" />
              </div>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start shopping to add amazing products to your cart
            </p>
            <Link
              href="/dashboard/products"
              className="block w-full sm:w-auto max-w-sm sm:max-w-none mx-auto sm:mx-0"
            >
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2.5 sm:gap-2 w-full min-h-[48px] sm:min-h-[44px] py-3.5 sm:py-3 px-6 sm:px-8 text-base sm:text-lg font-semibold rounded-lg bg-gradient-to-r from-[#F9629F] to-[#DB7093] hover:from-[#FC9BC2] hover:to-[#F9629F] text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <span>Browse Products</span>
                <FiArrowRight className="w-5 h-5 flex-shrink-0" />
              </motion.span>
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
                      <CartItem 
                        item={item} 
                        isSelected={selectedItems.has(productId)}
                        onToggleSelect={() => toggleItemSelection(productId)}
                      />
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
              <CartSummary 
                selectedAddress={selectedAddress} 
                selectedItemIds={selectedItems}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading cart..." />
          </div>
        </div>
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
