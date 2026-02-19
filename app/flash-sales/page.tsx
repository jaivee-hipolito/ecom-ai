'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiZap, FiClock, FiSearch, FiArrowLeft, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Footer from '@/components/shared/Footer';
import Pagination from '@/components/ui/Pagination';
import Loading from '@/components/ui/Loading';
import { useProducts } from '@/hooks/useProducts';
import { ProductFilters as ProductFiltersType, IProduct } from '@/types/product';
import ProductImage from '@/components/products/ProductImage';
import ProductRating from '@/components/products/ProductRating';
import QuickView from '@/components/products/QuickView';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

function FlashSalesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 5,
    minutes: 30,
    seconds: 0,
  });
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const limit = 12;

  // Get search from URL query params
  const searchFromUrl = searchParams.get('search');
  const pageFromUrl = searchParams.get('page');

  // Initialize search from URL
  useEffect(() => {
    if (searchFromUrl) {
      setSearchQuery(decodeURIComponent(searchFromUrl));
    }
    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl) || 1);
    }
  }, [searchFromUrl, pageFromUrl]);

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

  // Update URL when search or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const queryString = params.toString();
    const newUrl = `/flash-sales${queryString ? `?${queryString}` : ''}`;
    
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, currentPage, router]);

  // Build filters for flash sales (using featured products)
  const filters: ProductFiltersType = {
    featured: true,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  // Fetch flash sale products
  const { products, isLoading, error, pagination } = useProducts({
    filters,
    page: currentPage,
    limit,
    autoFetch: true,
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    let hash = 0;
    for (let i = 0; i < product._id.length; i++) {
      const char = product._id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const sold = Math.abs(hash % 51) + 30;
    const totalStock = product.stock + sold;
    const percentage = (sold / totalStock) * 100;
    
    return { percentage, sold };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] w-full overflow-x-hidden">
        {isAuthenticated && <DashboardSidebar />}
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] w-full overflow-x-hidden">
      {isAuthenticated && <DashboardSidebar />}
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
        <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #F9629F 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-white/80 hover:text-white mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back to Home</span>
              </motion.button>
            </Link>

            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center justify-center gap-2 sm:gap-3 mb-4 flex-wrap"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="hidden sm:block"
                >
                  <FiZap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#F9629F]" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Flash Sales
                </h1>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="hidden sm:block"
                >
                  <FiZap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#F9629F]" />
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
              >
                Don't miss out on these limited-time deals!
              </motion.p>

              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full border border-[#F9629F]/30 w-full sm:w-auto max-w-full mx-4 sm:mx-0"
              >
                <div className="flex items-center gap-2">
                  <FiClock className="w-4 h-4 sm:w-5 sm:h-6 text-[#F9629F] flex-shrink-0" />
                  <span className="text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap">Sale Ends in:</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <div className="bg-[#F9629F] text-[#000000] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base lg:text-lg min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center">
                    {String(timeLeft.days).padStart(2, '0')}D
                  </div>
                  <span className="text-white text-sm sm:text-base md:text-xl">:</span>
                  <div className="bg-[#F9629F] text-[#000000] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base lg:text-lg min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center">
                    {String(timeLeft.hours).padStart(2, '0')}H
                  </div>
                  <span className="text-white text-sm sm:text-base md:text-xl">:</span>
                  <div className="bg-[#F9629F] text-[#000000] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base lg:text-lg min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center">
                    {String(timeLeft.minutes).padStart(2, '0')}M
                  </div>
                  <span className="text-white text-sm sm:text-base md:text-xl">:</span>
                  <div className="bg-[#F9629F] text-[#000000] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm md:text-base lg:text-lg min-w-[45px] sm:min-w-[50px] md:min-w-[60px] text-center">
                    {String(timeLeft.seconds).padStart(2, '0')}S
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 w-full overflow-x-hidden">
        {/* Search and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
            {/* Search Bar */}
            <div className="w-full lg:w-auto lg:flex-1 max-w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search flash sale products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] transition-all shadow-lg bg-white text-[#000000] placeholder-gray-400 text-sm sm:text-base"
                />
                <FiSearch className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* Results Count */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 sm:mb-6 flex items-center justify-between w-full"
          >
            <p className="text-white font-medium text-sm sm:text-base">
              Showing{' '}
              <span className="text-[#F9629F] font-bold">
                {products.length}
              </span>{' '}
              of{' '}
              <span className="text-[#F9629F] font-bold">
                {pagination.total}
              </span>{' '}
              <span className="hidden sm:inline">flash sale products</span>
              <span className="sm:hidden">products</span>
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading size="lg" text="Loading flash sales..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full"
          >
            {products.map((product, index) => {
              const flashSaleData = calculateFlashSaleData(product);
              const { percentage: soldPercentage, sold } = calculateSoldPercentage(product);
              const hasDiscount = flashSaleData.hasDiscount;
              const discount = flashSaleData.discountPercentage;
              const displayedPrice = flashSaleData.displayedPrice;
              const crossedOutPrice = flashSaleData.crossedOutPrice;

              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
                >
                  {/* Flash Sale Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-lg flex items-center gap-1"
                    >
                      <FiZap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs font-bold">FLASH SALE</span>
                    </motion.div>
                  </div>

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
                        className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
                      >
                        <motion.button
                          onClick={(e) => handleQuickView(e, product._id!)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-[#000000] px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-[#F9629F] hover:text-white transition-all duration-300 text-sm sm:text-base"
                        >
                          <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Quick View</span>
                          <span className="sm:hidden">View</span>
                        </motion.button>
                      </motion.div>

                      {/* Discount Badge */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="bg-gradient-to-br from-[#F9629F] to-[#DB7093] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shadow-xl"
                        >
                          <div className="text-center">
                            <div className="text-[10px] sm:text-xs font-bold leading-tight">-{discount}%</div>
                            <div className="text-[7px] sm:text-[8px] font-semibold">OFF</div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 md:p-5">
                      {/* Product Name */}
                      <h3 className="text-base sm:text-lg font-bold text-[#000000] mb-2 line-clamp-2 group-hover:text-[#F9629F] transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="mb-2 sm:mb-3">
                        <ProductRating
                          rating={product.rating || 0}
                          numReviews={product.numReviews}
                          showReviews={true}
                        />
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold text-[#F9629F]">
                          {formatCurrency(displayedPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                            {formatCurrency(crossedOutPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-600 mb-1">
                          <span>Available: {product.stock}</span>
                          <span className="text-[#F9629F] font-semibold">Sold: {sold}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${soldPercentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-[#F9629F] to-[#DB7093] rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Quick View Modal */}
        <QuickView
          productId={quickViewProductId}
          isOpen={isQuickViewOpen}
          onClose={handleCloseQuickView}
        />

        {/* Pagination */}
        {!isLoading && !error && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mt-12 w-full overflow-x-auto"
          >
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 bg-white/10 backdrop-blur-sm rounded-lg shadow-md mx-2 sm:mx-0"
          >
            <div className="max-w-md mx-auto px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-full flex items-center justify-center">
                <FiZap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                No flash sale products found
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Check back soon for amazing flash sale deals!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#F9629F] text-white rounded-lg font-semibold hover:bg-[#DB7093] transition-colors shadow-lg text-sm sm:text-base"
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
      </div>
    </div>
  );
}

export default function FlashSalesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] w-full overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading flash sales..." />
        </div>
        <Footer />
      </div>
    }>
      <FlashSalesContent />
    </Suspense>
  );
}

