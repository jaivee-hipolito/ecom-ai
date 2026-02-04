'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowUpRight } from 'react-icons/fi';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';

interface HeroCarouselProps {
  products: IProduct[];
}

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Ensure we have at least 3 products for the carousel
  // Prioritize featured products, then products with stock
  const featuredProducts = products.filter((p) => p.featured && p.stock > 0);
  const inStockProducts = products.filter((p) => !p.featured && p.stock > 0);
  
  // Combine: featured first, then in-stock products, ensuring at least 3
  let carouselProducts = [...featuredProducts];
  if (carouselProducts.length < 3) {
    carouselProducts.push(...inStockProducts.slice(0, 3 - carouselProducts.length));
  }
  
  // If still less than 3, use all available products (up to 5)
  if (carouselProducts.length < 3 && products.length > carouselProducts.length) {
    const remainingProducts = products.filter(
      (p) => !carouselProducts.some((cp) => cp._id === p._id)
    );
    carouselProducts.push(...remainingProducts.slice(0, 3 - carouselProducts.length));
  }
  
  // Limit to maximum 5 products for carousel, but ensure at least 3
  carouselProducts = carouselProducts.slice(0, 5);

  useEffect(() => {
    if (!isAutoPlaying || carouselProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselProducts.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselProducts.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? carouselProducts.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselProducts.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Show carousel only if we have at least 3 products
  if (carouselProducts.length < 3) {
    return null;
  }

  const currentProduct = carouselProducts[currentIndex];

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
              {/* Left Section - Text Content */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col justify-center space-y-6 z-10"
              >
                {/* Sale Banner */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="inline-block"
                >
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm lg:text-base uppercase tracking-wider rounded-lg shadow-lg">
                    Sale! Up to 50% Off!
                  </span>
                </motion.div>

                {/* Product Name */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl lg:text-6xl font-bold text-[#050b2c] leading-tight"
                >
                  {currentProduct.name.split(' ').slice(0, -1).join(' ')}
                  <br />
                  <span className="text-[#ffa509]">
                    {currentProduct.name.split(' ').slice(-1).join(' ')}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-gray-600 text-base lg:text-lg max-w-md line-clamp-3"
                >
                  {currentProduct.description || 'Discover premium quality products designed for excellence.'}
                </motion.p>

                {/* Price */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-3xl lg:text-4xl font-bold text-[#050b2c]">
                    ${currentProduct.price.toFixed(2)}
                  </span>
                  {currentProduct.stock === 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                      Out of Stock
                    </span>
                  )}
                </motion.div>

                {/* Shop Now Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Link href={`/products/${currentProduct._id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex items-center gap-3 px-8 py-4 bg-[#050b2c] text-white rounded-lg font-bold text-base lg:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-[#0a1538]"
                    >
                      Shop Now
                      <FiArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Section - Product Image */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative h-full flex items-center justify-center"
              >
                <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
                  <div className="relative w-full h-full max-w-lg">
                    <ProductImage
                      product={currentProduct}
                      className="w-full h-full"
                      priority={currentIndex === 0}
                    />
                  </div>
                  {/* Decorative background circle */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#ffa509]/20 to-[#ff8c00]/10 rounded-full blur-3xl transform scale-150"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {carouselProducts.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-6 h-6 text-[#050b2c] group-hover:text-[#ffa509] transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            aria-label="Next slide"
          >
            <FiChevronRight className="w-6 h-6 text-[#050b2c] group-hover:text-[#ffa509] transition-colors" />
          </button>
        </>
      )}

      {/* Carousel Indicators */}
      {carouselProducts.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {carouselProducts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-12 h-1.5 bg-[#050b2c] rounded-full'
                  : 'w-8 h-1.5 bg-gray-300 hover:bg-gray-400 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

