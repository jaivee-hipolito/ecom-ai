'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import ProductRating from '@/components/products/ProductRating';
import { useProducts } from '@/hooks/useProducts';
import { FiZap, FiClock, FiEye, FiTrendingUp } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import QuickView from '@/components/products/QuickView';

interface FlashSalesProps {
  initialProducts?: IProduct[];
}

export default function FlashSales({ initialProducts = [] }: FlashSalesProps) {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 5,
    minutes: 30,
    seconds: 0,
  });

  // Fetch flash sale products - using featured products as flash sales
  // You can modify the filter to match your flash sale API endpoint
  const { products, isLoading } = useProducts({
    filters: { featured: true }, // Adjust this filter based on your flash sale API
    page: 1,
    limit: 8, // Show more products for flash sales
    autoFetch: true,
  });

  // Use fetched products or fallback to initial products
  const displayProducts = products.length > 0 ? products : initialProducts.slice(0, 8);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate discount percentage - deterministic based on product ID
  const calculateDiscount = (product: IProduct): number => {
    if (!product._id) return 20; // Default discount
    
    // Create a deterministic hash from product ID
    let hash = 0;
    for (let i = 0; i < product._id.length; i++) {
      const char = product._id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to generate consistent discount between 20-50%
    const discount = Math.abs(hash % 31) + 20;
    
    // Adjust based on product name if needed
    const name = product.name.toLowerCase();
    if (name.includes('watch') || name.includes('jbl') || name.includes('phone')) {
      return Math.min(discount + 5, 50); // Add 5% but cap at 50%
    }
    
    return discount;
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
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0a1538] to-[#050b2c] py-12 lg:py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ffa509 1px, transparent 0)`,
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
              <div className="absolute inset-0 bg-[#ffa509] blur-xl opacity-50 rounded-full"></div>
              <FiZap className="w-10 h-10 sm:w-12 sm:h-12 text-[#ffa509] relative z-10" />
            </motion.div>
            <motion.h2
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-[#ffa509] to-white bg-clip-text text-transparent">
                Flash Sales
              </span>
            </motion.h2>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#ffa509] blur-xl opacity-50 rounded-full"></div>
              <FiTrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-[#ffa509] relative z-10" />
            </motion.div>
          </div>
          
          {/* Countdown Timer - Enhanced */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-gradient-to-r from-white/15 via-white/20 to-white/15 backdrop-blur-md px-6 sm:px-8 py-4 sm:py-5 rounded-2xl border-2 border-[#ffa509]/40 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-[#ffa509]" />
              </motion.div>
              <span className="text-white font-bold text-sm sm:text-base">Ends in:</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {[
                { label: 'D', value: timeLeft.days },
                { label: 'H', value: timeLeft.hours },
                { label: 'M', value: timeLeft.minutes },
                { label: 'S', value: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    key={item.value}
                    initial={{ scale: 0.8, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] text-[#050b2c] px-3 sm:px-4 py-2 rounded-xl font-black text-sm sm:text-base shadow-lg min-w-[3rem] sm:min-w-[3.5rem] text-center"
                  >
                    {String(item.value).padStart(2, '0')}
                    <div className="text-[8px] sm:text-[10px] font-bold opacity-80">{item.label}</div>
                  </motion.div>
                  {idx < 3 && (
                    <span className="text-[#ffa509] font-bold text-lg sm:text-xl">:</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Products Grid - Compact Layout */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="Loading flash sales..." />
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product, index) => {
              const discount = calculateDiscount(product);
              const { percentage: soldPercentage, sold } = calculateSoldPercentage(product);
              const hasDiscount = discount > 0;
              const originalPrice = hasDiscount ? product.price / (1 - discount / 100) : product.price;

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
                  <Link href={`/products/${product._id}`} className="block">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#ffa509]/50 relative">
                      {/* Flash Sale Badge - Top Left */}
                      <div className="absolute top-2 left-2 z-30">
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                          className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5"
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <FiZap className="w-3 h-3" />
                          </motion.div>
                          <span className="text-[10px] font-black tracking-wide">FLASH</span>
                        </motion.div>
                      </div>

                      {/* Discount Badge - Top Right */}
                      <div className="absolute top-2 right-2 z-30">
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="bg-gradient-to-br from-[#ffa509] via-orange-500 to-[#ff8c00] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-2 border-white"
                        >
                          <div className="text-center">
                            <div className="text-xs font-black leading-tight">-{discount}%</div>
                            <div className="text-[7px] font-bold">OFF</div>
                          </div>
                        </motion.div>
                      </div>

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
                              className="bg-white text-[#050b2c] px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-lg hover:bg-[#ffa509] hover:text-white transition-all duration-300"
                            >
                              <FiEye className="w-4 h-4" />
                              <span>Quick View</span>
                            </motion.button>
                          </motion.div>
                        </div>

                        {/* Product Info - Compact */}
                        <div className="space-y-3">
                          {/* Product Name */}
                          <h3 className="text-base sm:text-lg font-bold text-[#050b2c] line-clamp-2 group-hover:text-[#ffa509] transition-colors min-h-[3rem]">
                            {product.name}
                          </h3>

                          {/* Rating - Compact */}
                          <div className="flex items-center gap-2">
                            <ProductRating
                              rating={product.rating || 0}
                              numReviews={product.numReviews}
                              showReviews={false}
                            />
                            <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
                          </div>

                          {/* Price - Prominent */}
                          <div className="flex items-baseline gap-2">
                            <motion.span
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#ffa509] to-orange-500 bg-clip-text text-transparent"
                            >
                              ${product.price.toFixed(2)}
                            </motion.span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-400 line-through">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Stock Progress Bar - Enhanced */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 font-medium">Available: <span className="text-[#050b2c] font-bold">{product.stock}</span></span>
                              <span className="text-[#ffa509] font-bold">Sold: {sold}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${soldPercentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-[#ffa509] via-orange-500 to-[#ff8c00] rounded-full shadow-lg relative overflow-hidden"
                              >
                                <motion.div
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Animated Border Glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ffa509]/0 via-[#ffa509]/20 to-[#ffa509]/0 opacity-0 group-hover:opacity-100"
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
                className="bg-[#ffa509] text-[#050b2c] px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
        />
      </div>
    </div>
  );
}

