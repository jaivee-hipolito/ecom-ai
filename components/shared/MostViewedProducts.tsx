'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import ProductRating from '@/components/products/ProductRating';
import { useProducts } from '@/hooks/useProducts';
import { FiEye, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import QuickView from '@/components/products/QuickView';

interface MostViewedProductsProps {
  initialProducts?: IProduct[];
}

export default function MostViewedProducts({ initialProducts = [] }: MostViewedProductsProps) {
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch most viewed products - sorted by views descending
  // Using a custom fetch since useProducts doesn't support custom sort params directly
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch most viewed products on mount
  useEffect(() => {
    const fetchMostViewed = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products?sortBy=views&sortOrder=desc&limit=8&page=1');
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else if (initialProducts.length > 0) {
          // Fallback to initial products if API returns empty
          setProducts(initialProducts.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch most viewed products:', error);
        if (initialProducts.length > 0) {
          setProducts(initialProducts.slice(0, 8));
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (initialProducts.length === 0) {
      fetchMostViewed();
    } else {
      setProducts(initialProducts.slice(0, 8));
    }
  }, [initialProducts]);

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

  const displayProducts = products.length > 0 ? products : initialProducts.slice(0, 8);

  if (displayProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              <FiTrendingUp className="w-8 h-8 text-[#ffa509]" />
            </motion.div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#050b2c]">
                Most Viewed Products
              </h2>
              <p className="text-gray-600 mt-1">
                Discover what others are checking out
              </p>
            </div>
          </div>
          <Link href="/products?sortBy=views&sortOrder=desc">
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 text-[#ffa509] hover:text-[#ff8c00] font-semibold transition-colors"
            >
              View All
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="Loading most viewed products..." />
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => {
              const viewCount = product.views || 0;

              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
                >
                  <Link href={`/products/${product._id}`} className="block">
                    {/* Product Image Container */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <ProductImage 
                        product={product} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      
                      {/* Quick View Overlay - Shows on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"
                      >
                        <motion.button
                          onClick={(e) => handleQuickView(e, product._id!)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-[#050b2c] px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-[#ffa509] hover:text-white transition-all duration-300"
                        >
                          <FiEye className="w-5 h-5" />
                          <span>Quick View</span>
                        </motion.button>
                      </motion.div>

                      {/* Views Badge */}
                      <div className="absolute top-3 right-3 z-30">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-[#050b2c]/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2"
                        >
                          <FiEye className="w-4 h-4 text-[#ffa509]" />
                          <span className="text-xs font-bold">{viewCount.toLocaleString()}</span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Product Name */}
                      <h3 className="text-lg font-bold text-[#050b2c] mb-2 line-clamp-2 group-hover:text-[#ffa509] transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="mb-3">
                        <ProductRating
                          rating={product.rating || 0}
                          numReviews={product.numReviews}
                          showReviews={true}
                        />
                      </div>

                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-[#050b2c]">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* View Count Info */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <FiEye className="w-3 h-3" />
                        <span>{viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}</span>
                      </div>
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
            <p className="text-gray-600 text-lg">
              No products available at the moment.
            </p>
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

