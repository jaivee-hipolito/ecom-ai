'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  FiMonitor,
  FiCamera,
  FiPhone,
  FiHeadphones,
  FiSpeaker,
  FiShield,
  FiPackage,
  FiShoppingBag,
  FiHome,
  FiBriefcase,
  FiZap,
  FiGrid,
  FiLayers,
  FiGift,
  FiTag,
  FiStar,
  FiMusic,
  FiFileText,
  FiHardDrive,
} from 'react-icons/fi';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

interface PopularCategoriesProps {
  categories: Category[];
}

// Enhanced category icon mapping with more realistic and relative icons
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  // Electronics & Tech
  if (name.includes('phone') || name.includes('smartphone') || name.includes('mobile')) 
    return { icon: FiPhone, color: 'bg-blue-500' };
  if (name.includes('tablet') || name.includes('ipad')) 
    return { icon: FiMonitor, color: 'bg-indigo-500' };
  if (name.includes('laptop') || name.includes('computer') || name.includes('pc')) 
    return { icon: FiMonitor, color: 'bg-indigo-600' };
  if (name.includes('monitor') || name.includes('display') || name.includes('screen')) 
    return { icon: FiMonitor, color: 'bg-purple-500' };
  if (name.includes('tv') || name.includes('television')) 
    return { icon: FiMonitor, color: 'bg-red-500' };
  if (name.includes('watch') || name.includes('smartwatch')) 
    return { icon: FiGrid, color: 'bg-cyan-500' };
  
  // Audio & Music
  if (name.includes('headphone') || name.includes('earphone') || name.includes('earbud')) 
    return { icon: FiHeadphones, color: 'bg-pink-500' };
  if (name.includes('speaker') || name.includes('sound')) 
    return { icon: FiSpeaker, color: 'bg-red-500' };
  if (name.includes('audio') || name.includes('music')) 
    return { icon: FiMusic, color: 'bg-orange-500' };
  if (name.includes('mic') || name.includes('microphone')) 
    return { icon: FiMusic, color: 'bg-purple-500' };
  
  // Camera & Photo
  if (name.includes('camera') || name.includes('photo') || name.includes('photography')) 
    return { icon: FiCamera, color: 'bg-yellow-400' };
  if (name.includes('video') || name.includes('camcorder')) 
    return { icon: FiCamera, color: 'bg-red-600' };
  
  // Gaming
  if (name.includes('game') || name.includes('gaming') || name.includes('console')) 
    return { icon: FiZap, color: 'bg-orange-500' };
  
  // Home & Kitchen
  if (name.includes('kitchen') || name.includes('cook')) 
    return { icon: FiHome, color: 'bg-teal-400' };
  if (name.includes('appliance') || name.includes('home')) 
    return { icon: FiHome, color: 'bg-blue-400' };
  if (name.includes('smart home') || name.includes('smart-home') || name.includes('automation')) 
    return { icon: FiZap, color: 'bg-blue-500' };
  
  // Office & Stationery
  if (name.includes('office') || name.includes('stationery') || name.includes('stationary')) 
    return { icon: FiBriefcase, color: 'bg-lime-500' };
  if (name.includes('printer') || name.includes('scanner')) 
    return { icon: FiFileText, color: 'bg-gray-600' };
  
  // Storage & Accessories
  if (name.includes('storage') || name.includes('hard drive') || name.includes('ssd') || name.includes('usb')) 
    return { icon: FiHardDrive, color: 'bg-gray-700' };
  if (name.includes('accessor') || name.includes('accessory')) 
    return { icon: FiGrid, color: 'bg-purple-500' };
  
  // Security
  if (name.includes('security') || name.includes('surveillance') || name.includes('cctv')) 
    return { icon: FiShield, color: 'bg-gray-600' };
  
  // General
  if (name.includes('electronics') || name.includes('electronic')) 
    return { icon: FiMonitor, color: 'bg-purple-500' };
  if (name.includes('software') || name.includes('app')) 
    return { icon: FiLayers, color: 'bg-cyan-500' };
  if (name.includes('gift') || name.includes('special')) 
    return { icon: FiGift, color: 'bg-pink-500' };
  if (name.includes('sale') || name.includes('deal')) 
    return { icon: FiTag, color: 'bg-red-500' };
  if (name.includes('featured') || name.includes('popular')) 
    return { icon: FiStar, color: 'bg-yellow-500' };
  
  // Default
  return { icon: FiPackage, color: 'bg-gray-400' };
};

export default function PopularCategories({ categories }: PopularCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-[#050b2c] mb-2">
            Popular Categories
          </h2>
          <p className="text-gray-600">
            Browse our wide range of product categories
          </p>
        </motion.div>

        {/* Swiper Carousel */}
        <div className="relative px-10 lg:px-14">
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: '.swiper-button-next-categories',
              prevEl: '.swiper-button-prev-categories',
            }}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 24,
              },
            }}
            className="!pb-12"
          >
            {categories.map((category, index) => {
              const { icon: Icon, color } = getCategoryIcon(category.name);
              
              return (
                <SwiperSlide key={category._id}>
                  <Link href={`/dashboard/products?category=${encodeURIComponent(category.name)}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-3 cursor-pointer group"
                    >
                      {/* Category Circle - Reduced Size */}
                      <div className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-full ${color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                        {/* Gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        {/* Icon - Reduced Size */}
                        <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Category Name */}
                      <span className="text-[#050b2c] font-semibold text-xs lg:text-sm text-center group-hover:text-[#ffa509] transition-colors line-clamp-2 max-w-[100px]">
                        {category.name}
                      </span>
                    </motion.div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <motion.button
            className="swiper-button-prev-categories absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group border-2 border-gray-200 hover:border-[#ffa509] hover:bg-[#ffa509]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous"
          >
            <FiChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
          </motion.button>
          <motion.button
            className="swiper-button-next-categories absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group border-2 border-gray-200 hover:border-[#ffa509] hover:bg-[#ffa509]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next"
          >
            <FiChevronRight className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

