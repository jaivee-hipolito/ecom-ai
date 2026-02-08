'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Loading from '@/components/ui/Loading';
import HeroCarousel from '@/components/shared/HeroCarousel';
import PopularCategories from '@/components/shared/PopularCategories';
import DealOfTheDay from '@/components/shared/DealOfTheDay';
import DiscountCodes from '@/components/shared/DiscountCodes';
import FlashSales from '@/components/shared/FlashSales';
import MostViewedProducts from '@/components/shared/MostViewedProducts';
import Footer from '@/components/shared/Footer';
import { useProducts } from '@/hooks/useProducts';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { products, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 20, // Fetch more products to ensure we have enough for carousel
    autoFetch: true, // Fetch for all users
  });
  
  // Fetch featured products for carousel
  const { products: featuredProducts } = useProducts({
    filters: { featured: true },
    page: 1,
    limit: 5,
    autoFetch: true, // Fetch for all users
  });

  // Fetch categories for all users
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {isAuthenticated && <DashboardSidebar />}
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64 pt-16 lg:pt-0' : ''} overflow-x-hidden`}>
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  // Show landing page with products for all users
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {isAuthenticated && <DashboardSidebar />}
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64 pt-16 lg:pt-0' : ''} overflow-x-hidden`}>
        <Navbar />
        <main>
          {/* Search Section - For non-authenticated users */}
          {!isAuthenticated && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#050b2c] via-[#0a1538] to-[#050b2c] py-8 sm:py-12"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    Search Products
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base">
                    Find exactly what you're looking for
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="relative"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products by name, category, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 pl-14 pr-32 sm:pr-36 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-all shadow-lg hover:shadow-xl text-gray-900 placeholder-gray-400 bg-white text-base sm:text-lg"
                      style={{ color: '#111827' }}
                    />
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white rounded-lg font-semibold text-sm sm:text-base hover:shadow-lg transition-all"
                    >
                      Search
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.section>
          )}

          {/* Hero Carousel Section */}
          {productsLoading ? (
            <div className="h-[500px] lg:h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <Loading size="lg" text="Loading featured products..." />
            </div>
          ) : (() => {
            // Combine featured and regular products, ensuring at least 3 products
            const allProducts = [...featuredProducts];
            
            // Add regular products that aren't already in featured list
            const regularProducts = products.filter(
              (p) => !allProducts.some((fp) => fp._id === p._id) && p.stock > 0
            );
            allProducts.push(...regularProducts);
            
            // Ensure we have at least 3 products, but show all available if less than 3
            const carouselProducts = allProducts.length >= 3 
              ? allProducts.slice(0, Math.min(5, allProducts.length))
              : allProducts;
            
            return carouselProducts.length >= 3 ? (
              <HeroCarousel products={carouselProducts} />
            ) : carouselProducts.length > 0 ? (
              <HeroCarousel products={carouselProducts} />
            ) : null;
          })()}

          {/* Popular Categories Section */}
          {categories.length > 0 && (
            <PopularCategories categories={categories} />
          )}

          {/* Deal of the Day Section */}
          {!productsLoading && (
            <DealOfTheDay initialProducts={products} />
          )}

          {/* Flash Sales Section */}
          {!productsLoading && (
            <FlashSales initialProducts={products} />
          )}

          {/* Most Viewed Products Section */}
          {!productsLoading && (
            <MostViewedProducts initialProducts={products} />
          )}

          {/* Discount Codes Section */}
          <DiscountCodes />
        </main>
        <Footer />
      </div>
    </div>
  );
}
