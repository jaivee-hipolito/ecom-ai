'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import { useProducts } from '@/hooks/useProducts';
import { FiEye, FiArrowRight } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import QuickView from '@/components/products/QuickView';
import { formatCurrency } from '@/utils/currency';

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

  // Fetch only products that have a discount (marked as flash sale in admin)
  // so "Deal of the Day" shows actual deals; optional filter by category
  const { products, isLoading } = useProducts({
    filters: selectedCategory
      ? { category: selectedCategory, isFlashSale: true }
      : { isFlashSale: true },
    page: 1,
    limit: 4,
    autoFetch: true,
  });

  // Use fetched products; fallback to initial products that are flash sale only when no category selected
  const displayProducts = products.length > 0
    ? products
    : (selectedCategory === null ? (initialProducts.filter((p) => p.isFlashSale).slice(0, 4)) : []);

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

  // Calculate flash sale discount and prices from product data
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: IProduct) => {
    if (!product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
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
      discountPercentage: Math.round(discountPercentage),
      displayedPrice,
      crossedOutPrice,
      hasDiscount: true,
    };
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
            <h2 className="text-3xl lg:text-4xl font-bold text-[#000000]">
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
                      ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 shadow-lg'
                      : 'bg-white text-[#000000] border-2 border-gray-200 hover:border-[#F9629F]'
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product, index) => {
              const flashSaleData = calculateFlashSaleData(product);
              const hasDiscount = flashSaleData.hasDiscount;
              const discount = flashSaleData.discountPercentage;
              const displayedPrice = flashSaleData.displayedPrice;
              const crossedOutPrice = flashSaleData.crossedOutPrice;

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
                  <Link href={`/products/${product._id}${hasDiscount ? '?flashSale=true' : ''}`} className="block">
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
                          className="bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-[#FC9BC2] transition-all duration-300"
                        >
                          <FiEye className="w-5 h-5" />
                          <span>Quick View</span>
                        </motion.button>
                      </motion.div>
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="absolute top-3 right-3 bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-30"
                        >
                          <div className="text-center">
                            <div className="text-xs font-black leading-tight">-{discount}%</div>
                            <div className="text-[7px] font-bold">OFF</div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      {/* Product Name */}
                      <h3 className="text-lg font-bold text-[#000000] mb-2 line-clamp-2 group-hover:text-[#F9629F] transition-colors">
                        {product.name}
                      </h3>


                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        {hasDiscount ? (
                          <>
                            <span className="text-2xl font-bold bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent">
                              {formatCurrency(displayedPrice)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {formatCurrency(crossedOutPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-[#000000]">
                            {formatCurrency(product.price)}
                          </span>
                        )}
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

        {/* View all deals - bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mt-10"
        >
          <Link
            href="/deal-of-the-day"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9629F] text-white font-semibold rounded-xl hover:bg-[#DB7093] transition-colors shadow-lg hover:shadow-[#F9629F]/30"
          >
            View all deals
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Quick View Modal */}
        <QuickView
          productId={quickViewProductId}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
          isFlashSale={displayProducts.find(p => p._id === quickViewProductId)?.isFlashSale || false}
        />
      </div>
    </div>
  );
}

