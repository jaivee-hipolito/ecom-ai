'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import { useProducts } from '@/hooks/useProducts';
import { FiZap, FiEye, FiTrendingUp } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import QuickView from '@/components/products/QuickView';
import { formatCurrency } from '@/utils/currency';

interface FlashSalesProps {
  initialProducts?: IProduct[];
}

export default function FlashSales({ initialProducts = [] }: FlashSalesProps) {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch flash sale products - only products marked as flash sale
  const { products, isLoading } = useProducts({
    filters: { isFlashSale: true },
    page: 1,
    limit: 8, // Show more products for flash sales
    autoFetch: true,
  });

  // Only use fetched flash sale products - don't use initialProducts fallback
  // This ensures we only show products that are actually marked as flash sale in the database
  const displayProducts = products;

  // Calculate flash sale discount and prices from product data
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: IProduct) => {
    if (!product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
        discount: 0,
        discountPercentage: 0,
        displayedPrice: product.price,
        crossedOutPrice: product.price,
        hasDiscount: false,
      };
    }

    const discount = product.flashSaleDiscount;
    const discountType = product.flashSaleDiscountType || 'percentage';
    
    let displayedPrice: number;
    let crossedOutPrice: number;
    let discountPercentage: number;

    // Displayed price is always the product.price
    displayedPrice = product.price;

    if (discountType === 'percentage') {
      // Crossed out price = price * (percentage/100) + price
      crossedOutPrice = displayedPrice * (discount / 100) + displayedPrice;
      discountPercentage = discount;
    } else {
      // Fixed amount: crossed out price = price + discount
      crossedOutPrice = displayedPrice + discount;
      discountPercentage = (discount / displayedPrice) * 100;
    }

    return {
      discount,
      discountPercentage: Math.round(discountPercentage),
      displayedPrice,
      crossedOutPrice,
      hasDiscount: true,
    };
  };

  // Calculate sold percentage for progress bar - deterministic based on product ID
  const calculateSoldPercentage = (product: IProduct): { percentage: number; sold: number } => {
    if (!product._id) {
      const defaultSold = 30;
      const totalStock = product.stock + defaultSold;
      return {
        percentage: (defaultSold / totalStock) * 100,
        sold: defaultSold
      };
    }
    
    // Create a deterministic hash from product ID
    let hash = 0;
    for (let i = 0; i < product._id.length; i++) {
      const char = product._id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Use hash to generate consistent sold amount between 30-80
    const sold = Math.abs(hash % 51) + 30;
    const totalStock = product.stock + sold;
    const percentage = (sold / totalStock) * 100;
    
    return { percentage, sold };
  };

  // Handle Quick View
  const handleQuickView = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProductId(productId);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProductId(null), 300);
  };

  if (displayProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] py-12 lg:py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #F9629F 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12"
        >
          {/* Title with Animated Icons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#F9629F] blur-xl opacity-50 rounded-full"></div>
              <FiZap className="w-10 h-10 sm:w-12 sm:h-12 text-[#F9629F] relative z-10" />
            </motion.div>
            <motion.h2
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-[#F9629F] to-white bg-clip-text text-transparent">
                Flash Sales
              </span>
            </motion.h2>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#F9629F] blur-xl opacity-50 rounded-full"></div>
              <FiTrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-[#F9629F] relative z-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Products Grid - Compact Layout */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="Loading flash sales..." />
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product, index) => {
              const flashSaleData = calculateFlashSaleData(product);
              const { discountPercentage, displayedPrice, crossedOutPrice, hasDiscount } = flashSaleData;

              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative"
                >
                  <Link href={`/products/${product._id}?flashSale=true`} className="block">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#F9629F]/50 relative">
                      {/* Discount Badge - Top Right */}
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 z-30">
                          <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 rounded-full w-14 h-14 flex items-center justify-center shadow-xl"
                          >
                            <div className="text-center">
                              <div className="text-xs font-black leading-tight">-{discountPercentage}%</div>
                              <div className="text-[7px] font-bold">OFF</div>
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Compact Product Layout */}
                      <div className="p-4 sm:p-5">
                        {/* Small Image Container */}
                        <div className="relative mb-4 bg-gray-100 rounded-xl overflow-hidden group/image">
                          <div className="aspect-square w-full max-w-[140px] mx-auto">
                            <ProductImage 
                              product={product} 
                              className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500" 
                            />
                          </div>
                          
                          {/* Quick View Button - Compact */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 rounded-xl"
                          >
                            <motion.button
                              onClick={(e) => handleQuickView(e, product._id!)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-lg hover:bg-[#FC9BC2] transition-all duration-300"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>Quick View</span>
                            </motion.button>
                          </motion.div>
                        </div>

                        {/* Product Info - Compact */}
                        <div className="space-y-3">
                          {/* Product Name */}
                          <h3 className="text-base sm:text-lg font-bold text-[#000000] line-clamp-2 group-hover:text-[#F9629F] transition-colors min-h-[3rem]">
                            {product.name}
                          </h3>


                          {/* Price - Prominent */}
                          <div className="flex items-baseline gap-2">
                            <motion.span
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent"
                            >
                              {formatCurrency(displayedPrice)}
                            </motion.span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(crossedOutPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Animated Border Glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F9629F]/0 via-[#F9629F]/20 to-[#F9629F]/0 opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-white text-lg">
              No flash sale products available at the moment.
            </p>
          </motion.div>
        )}

        {/* View All Button */}
        {displayProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Link href="/flash-sales">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-[#FC9BC2] hover:shadow-xl transition-all duration-300"
              >
                View All Flash Sales
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Quick View Modal */}
        <QuickView
          productId={quickViewProductId}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
          isFlashSale={true}
        />
      </div>
    </div>
  );
}

