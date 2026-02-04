'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import ProductRating from '@/components/products/ProductRating';
import { useProducts } from '@/hooks/useProducts';
import { FiZap, FiClock, FiEye } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import QuickView from '@/components/products/QuickView';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface DealOfTheDayProps {
  initialProducts?: IProduct[];
}

export default function DealOfTheDay({ initialProducts = [] }: DealOfTheDayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilterButtons, setCategoryFilterButtons] = useState<string[]>(['All Products']);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories');
        const data = await response.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          // Set filter buttons: All Products + first 3 categories
          const categoryNames = data.categories.slice(0, 3).map((cat: Category) => cat.name);
          setCategoryFilterButtons(['All Products', ...categoryNames]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on selected category
  // When null (All Products), fetch all products; otherwise filter by category
  const { products, isLoading } = useProducts({
    filters: selectedCategory ? { category: selectedCategory } : {},
    page: 1,
    limit: 4,
    autoFetch: true, // Always fetch to get fresh data
  });

  // Use fetched products, fallback to initial products if no products fetched yet
  const displayProducts = products.length > 0 ? products : (selectedCategory === null ? initialProducts.slice(0, 4) : []);

  const [timeLeft, setTimeLeft] = useState({
    days: 11,
    hours: 13,
    minutes: 45,
    seconds: 51,
  });

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === 'All Products') {
      setSelectedCategory(null);
    } else {
      // Find the exact category from the database to ensure we use the correct name
      // This handles any case sensitivity or whitespace issues
      const foundCategory = categories.find(
        c => c.name.toLowerCase().trim() === category.toLowerCase().trim()
      );
      
      if (foundCategory) {
        // Use the exact category name from the database
        setSelectedCategory(foundCategory.name);
        console.log('Setting category to:', foundCategory.name);
      } else {
        // Fallback: use the category name as-is
        console.warn('Category not found in database, using as-is:', category);
        setSelectedCategory(category);
      }
    }
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
    // Clear product ID after animation completes
    setTimeout(() => setQuickViewProductId(null), 300);
  };

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

  // Calculate discount percentage (mock calculation - you can add actual discount field to product)
  const calculateDiscount = (product: IProduct): number => {
    // Mock discount calculation - in real app, this would come from product data
    if (product.name.toLowerCase().includes('watch') || product.name.toLowerCase().includes('jbl')) {
      return 25;
    }
    return 0;
  };

  // Calculate sold percentage for progress bar
  const calculateSoldPercentage = (product: IProduct): number => {
    const totalStock = product.stock + 50; // Assuming 50 sold (mock data)
    const sold = 50;
    return (sold / totalStock) * 100;
  };

  // Debug logging
  useEffect(() => {
    if (selectedCategory) {
      console.log('Selected category:', selectedCategory);
      console.log('Products found:', products.length);
      console.log('Is loading:', isLoading);
    }
  }, [selectedCategory, products.length, isLoading]);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <FiZap className="w-8 h-8 text-[#ffa509]" />
            <h2 className="text-3xl lg:text-4xl font-bold text-[#050b2c]">
              Deal of the Day
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Don't miss out on these amazing deals!
          </p>
        </motion.div>

        {/* Category Filter Buttons */}
        {categoryFilterButtons.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {categoryFilterButtons.map((category) => {
              // Check if this button should be highlighted
              const isActive = category === 'All Products' 
                ? selectedCategory === null
                : selectedCategory !== null && (
                    selectedCategory.toLowerCase().trim() === category.toLowerCase().trim() ||
                    categories.some(c => c.name === selectedCategory && c.name === category)
                  );
              
              return (
                <motion.button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm lg:text-base transition-all duration-300 ${
                    isActive
                      ? 'bg-[#ffa509] text-white shadow-lg shadow-[#ffa509]/30'
                      : 'bg-white text-[#050b2c] border-2 border-gray-200 hover:border-[#ffa509]'
                  }`}
                >
                  {category}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="Loading deals..." />
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => {
              const discount = calculateDiscount(product);
              const soldPercentage = calculateSoldPercentage(product);
              const hasDiscount = discount > 0;
              const originalPrice = hasDiscount ? product.price / (1 - discount / 100) : product.price;

              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
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
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full px-3 py-1.5 font-bold text-sm shadow-lg z-30"
                        >
                          -{discount}%
                        </motion.div>
                      )}

                      {/* Hot Sale Badge */}
                      {hasDiscount && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-gradient-to-r from-[#ffa509] to-orange-500 text-white px-3 py-2 rounded-lg shadow-lg z-30"
                        >
                          <FiZap className="w-4 h-4" />
                          <span className="text-xs font-semibold">HOT SALE {discount}% OFF</span>
                        </motion.div>
                      )}

                      {/* Timer Badge (for first product) */}
                      {index === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="absolute top-3 left-3 bg-[#050b2c] text-white px-3 py-2 rounded-lg shadow-lg z-30 flex items-center gap-2"
                        >
                          <FiClock className="w-4 h-4 text-[#ffa509]" />
                          <span className="text-xs font-bold">
                            {timeLeft.days}D : {timeLeft.hours}H : {timeLeft.minutes}M : {timeLeft.seconds}S
                          </span>
                        </motion.div>
                      )}
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
                      <div className="flex items-center gap-2 mb-4">
                        {hasDiscount ? (
                          <>
                            <span className="text-2xl font-bold text-[#ffa509]">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              ${originalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-[#050b2c]">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Available: {product.stock}</span>
                          <span>Sold: 50</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${soldPercentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                          />
                        </div>
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
              No products found in this category.
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

