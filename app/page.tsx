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
import Image from 'next/image';

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
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
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
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
        <Navbar />
        <main>
          {/* Value props bar: On-hand · Tax-free · Investment */}
          <section className="bg-gray-50 border-b border-gray-200/80 overflow-x-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              <div className="flex flex-nowrap items-center justify-center gap-0 divide-x divide-gray-300/60">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="flex flex-col items-center justify-center flex-shrink-0 px-6 sm:px-8 lg:px-12"
                >
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Everything</span>
                  <span className="mt-0.5 font-bold text-sm sm:text-base lg:text-lg text-[#000000] whitespace-nowrap">On-hand</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col items-center justify-center flex-shrink-0 px-6 sm:px-8 lg:px-12"
                >
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Always</span>
                  <span className="mt-0.5 font-bold text-sm sm:text-base lg:text-lg text-[#F9629F] whitespace-nowrap">Tax-free</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="flex flex-col items-center justify-center flex-shrink-0 px-6 sm:px-8 lg:px-12"
                >
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Elegant</span>
                  <span className="mt-0.5 font-bold text-sm sm:text-base lg:text-lg text-[#000000] whitespace-nowrap">Investment</span>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Brand tagline - professional ecommerce block before payment options */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-50/60 border-y border-gray-200/80 py-7 sm:py-9"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-lg sm:text-xl lg:text-2xl text-[#000000] tracking-wide max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                &ldquo;𝓔𝓵𝓮𝓿𝓪𝓽𝓮 𝔂𝓸𝓾𝓻 𝓵𝓸𝓸𝓴 𝔀𝓲𝓽𝓱 𝓮𝔁𝓺𝓾𝓲𝓼𝓲𝓽𝓮 𝓳𝓮𝔀𝓮𝓵𝓼&rdquo;
              </p>
              <div className="mt-4 w-12 h-px bg-[#F9629F]/60 mx-auto rounded-full" aria-hidden />
            </div>
          </motion.section>

          {/* Payment options: Affirm, Klarna, Afterpay - visible for all users (signed in or not) */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-50/80 border-y border-gray-200/90 py-8 sm:py-10"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-6 sm:mb-7">
                <h3 className="text-sm font-bold uppercase tracking-[0.28em] text-[#000000] mb-3">
                  Shop now. Pay later.
                </h3>
                <p className="text-[#000000] text-base sm:text-lg font-semibold leading-relaxed max-w-2xl mx-auto text-gray-800" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  ✨ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴊᴇᴡᴇʟʀʏ ɪɴᴠᴇꜱᴛᴍᴇɴᴛ ᴛᴏᴅᴀʏ ᴀɴᴅ ᴘᴀʏ ᴏᴠᴇʀ ᴛɪᴍᴇ ᴡɪᴛʜ ꜰʟᴇxɪʙʟᴇ ɪɴꜱᴛᴀʟʟᴍᴇɴᴛ ᴏᴘᴛɪᴏɴꜱ. ᴄʜᴏᴏꜱᴇ ꜰʀᴏᴍ ᴛʀᴜꜱᴛᴇᴅ ᴘʀᴏᴠɪᴅᴇʀꜱ ɪɴᴄʟᴜᴅɪɴɢ ᴀꜰꜰɪʀᴍ, ᴋʟᴀʀɴᴀ ᴀɴᴅ ᴀꜰᴛᴇʀᴘᴀʏ—ᴍᴀᴋɪɴɢ ɪᴛ ᴇᴀꜱʏ ᴛᴏ ꜱʜᴏᴘ ɴᴏᴡ ᴀɴᴅ ᴘᴀʏ ʟᴀᴛᴇʀ ᴡɪᴛʜ ᴄᴏɴꜰɪᴅᴇɴᴄᴇ. ✨
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {/* Affirm - text logo with blue arc only, same visual size as Klarna/Afterpay */}
                <div className="flex items-center justify-center py-2.5">
                  <Image src="/payment/affirm-logo.svg" alt="Affirm" width={120} height={36} className="h-9 sm:h-10 w-auto object-contain" unoptimized />
                </div>
                {/* Klarna - "Klarna." in black on light pink rounded rectangle */}
                <div className="px-4 py-2.5 rounded-xl flex items-center justify-center bg-[#FDE2E8]">
                  <span className="font-bold text-base sm:text-lg text-black">Klarna.</span>
                </div>
                {/* Afterpay - "afterpay" + loop icon in black on light mint rounded rectangle */}
                <div className="px-4 py-2.5 rounded-xl flex items-center gap-2 bg-[#C4F2E8]">
                  <span className="font-bold text-base sm:text-lg text-black lowercase">afterpay</span>
                  {/* Afterpay loop / exchange icon */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black flex-shrink-0">
                    <path d="M4 12L2 8L4 4M12 4L14 8L12 12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {/* Or other options: Interac e-Transfer & Visa/Mastercard - matched size, professional ecommerce */}
              <div className="mt-7 pt-6 border-t border-gray-200">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 mb-4">
                  Or pay with
                </p>
                <div className="flex flex-wrap items-stretch justify-center gap-4 sm:gap-5">
                  {/* Interac e-Transfer - fixed size card to match */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="w-[180px] sm:w-[200px] rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all overflow-hidden flex flex-col"
                  >
                    <div className="flex-1 flex items-center justify-center min-h-[52px] p-3">
                      <div className="inline-flex items-stretch overflow-hidden rounded-md border border-gray-200/80 shadow-inner">
                        <div className="flex items-center pl-2 pr-1.5 py-1.5 bg-[#f5a623]" style={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>
                          <span className="font-black text-[#2d2d2d] text-[11px] uppercase italic tracking-tight">Interac</span>
                        </div>
                        <div className="flex items-center px-2 py-1.5 bg-[#4a4a4a]" style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>
                          <span className="font-bold text-white text-[11px]">e-Transfer</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-700 py-2 px-3 border-t border-gray-100">Interac e-Transfer</p>
                  </motion.div>
                  {/* Visa & Mastercard - same card size */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="w-[180px] sm:w-[200px] rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
                  >
                    <div className="flex-1 flex items-center justify-center min-h-[52px] gap-3 p-3">
                      <span className="font-bold text-sm tracking-tight text-[#1A1F71]">Visa</span>
                      <div className="relative w-8 h-5 flex items-center justify-center flex-shrink-0">
                        <span className="absolute w-4 h-4 rounded-full bg-[#EB001B]" style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
                        <span className="absolute w-4 h-4 rounded-full bg-[#F79E1B]" style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
                        <span className="relative z-10 font-bold text-[6px] text-white uppercase tracking-tight" style={{ textShadow: '0 0 1px #000' }}>Mastercard</span>
                      </div>
                    </div>
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-black py-2 px-3 border-t border-gray-100">Debit &amp; Credit</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Popular Categories Section - before Search */}
          {categories.length > 0 && (
            <PopularCategories categories={categories} products={products} />
          )}

          {/* Search Section - For non-authenticated users */}
          {!isAuthenticated && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] py-8 sm:py-12"
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
                      className="w-full px-6 py-4 pl-14 pr-32 sm:pr-36 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] transition-all shadow-lg hover:shadow-xl text-gray-900 placeholder-gray-400 bg-white text-base sm:text-lg"
                      style={{ color: '#111827' }}
                    />
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#FC9BC2] transition-all"
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
