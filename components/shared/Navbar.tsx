'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiChevronDown,
  FiMonitor,
  FiCamera,
  FiPhone,
  FiHeadphones,
  FiSpeaker,
  FiShield,
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiBook,
  FiLayers,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiZap,
  FiSearch,
  FiClock,
  FiBell,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

// Category icon mapping
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('accessor')) return FiMonitor;
  if (name.includes('camera') || name.includes('photo')) return FiCamera;
  if (name.includes('phone') || name.includes('smartphone')) return FiPhone;
  if (name.includes('tv') || name.includes('audio')) return FiMonitor;
  if (name.includes('computer') || name.includes('laptop')) return FiMonitor;
  if (name.includes('software')) return FiMonitor;
  if (name.includes('headphone')) return FiHeadphones;
  if (name.includes('speaker') || name.includes('audio')) return FiSpeaker;
  if (name.includes('security') || name.includes('surveillance')) return FiShield;
  return FiPackage;
};

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { getCartSummary } = useCart();
  const cartSummary = getCartSummary();
  const cartItemCount = cartSummary.totalItems;
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [showFlashSaleBanner, setShowFlashSaleBanner] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 5,
    minutes: 29,
    seconds: 37,
  });
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Fetch categories
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

  // Close shop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target as Node)
      ) {
        setShopDropdownOpen(false);
        setCategoriesDropdownOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
    };

    if (shopDropdownOpen || searchDropdownOpen || categoriesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shopDropdownOpen, searchDropdownOpen, categoriesDropdownOpen]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('search', searchQuery.trim());
      if (selectedCategory) {
        params.set('category', selectedCategory);
      }
      router.push(`/products?${params.toString()}`);
      setSearchQuery('');
      setSelectedCategory('');
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-[#050b2c] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-[#ffa509]/20 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-[#ffa509]/20 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Flash Sale Notification Banner */}
      <AnimatePresence>
        {showFlashSaleBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#ffa509] via-orange-500 to-[#ffa509] text-white sticky top-0 z-[60] shadow-lg"
            style={{ margin: 0, padding: 0 }}
          >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 relative w-full">
                <div className="flex items-center gap-2 sm:gap-4 justify-center flex-1">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    className="hidden sm:block"
                  >
                    <FiBell className="w-5 h-5 lg:w-6 lg:h-6" />
                  </motion.div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                    <span className="font-bold text-xs sm:text-sm lg:text-base xl:text-lg">🔥 FLASH SALE!</span>
                    <span className="hidden sm:inline text-xs sm:text-sm">Ends in:</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded font-bold text-[10px] sm:text-xs lg:text-sm">
                        {String(timeLeft.days).padStart(2, '0')}D
                      </span>
                      <span className="text-xs sm:text-sm">:</span>
                      <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded font-bold text-[10px] sm:text-xs lg:text-sm">
                        {String(timeLeft.hours).padStart(2, '0')}H
                      </span>
                      <span className="text-xs sm:text-sm">:</span>
                      <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded font-bold text-[10px] sm:text-xs lg:text-sm">
                        {String(timeLeft.minutes).padStart(2, '0')}M
                      </span>
                      <span className="text-xs sm:text-sm">:</span>
                      <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded font-bold text-[10px] sm:text-xs lg:text-sm">
                        {String(timeLeft.seconds).padStart(2, '0')}S
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link href="/flash-sales">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-[#ffa509] px-3 sm:px-4 py-1 rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      Shop Now
                    </motion.button>
                  </Link>
                  <button
                    onClick={() => setShowFlashSaleBanner(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Close banner"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav 
        className={`bg-[#050b2c] shadow-xl sticky z-50 ${showFlashSaleBanner ? 'top-[56px] sm:top-[64px] lg:top-[72px]' : 'top-0'}`}
        style={{ margin: 0, padding: 0, marginTop: '-5px', width: '100%', maxWidth: '100%' }}
      >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4 py-2 sm:py-3">
          {/* Left Section - Shop By Categories */}
            <div className="relative w-full sm:w-auto" ref={shopDropdownRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#ffa509] text-white font-semibold text-xs sm:text-sm lg:text-base hover:bg-[#ffa509]/90 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer whitespace-nowrap"
            >
                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Shop By Categories</span>
              <span className="sm:hidden">Categories</span>
              <FiChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Categories Dropdown */}
            <AnimatePresence>
              {categoriesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                >
                  <div className="p-2">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-3 hover:bg-[#ffa509]/10 transition-colors rounded-lg text-gray-900 font-semibold border-b border-gray-200 mb-2"
                    >
                      All Categories
                    </Link>
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.name);
                      return (
                        <Link
                          key={category._id}
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffa509]/10 transition-colors rounded-lg group"
                        >
                          <Icon className="w-5 h-5 text-[#ffa509] group-hover:scale-110 transition-transform" />
                          <span className="flex-1 text-gray-900 font-medium group-hover:text-[#050b2c]">
                            {category.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>

            {/* Search Bar with Category Dropdown */}
            <div className="flex-1 w-full sm:max-w-2xl" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-stretch">
                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
                      className="h-10 sm:h-12 px-2 sm:px-3 lg:px-4 bg-white border-2 border-r-0 border-gray-300 rounded-l-lg hover:border-[#ffa509] transition-colors flex items-center gap-1 sm:gap-2 text-[#050b2c] font-medium text-xs sm:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">
                        {selectedCategory || 'All Categories'}
                      </span>
                      <span className="sm:hidden">All</span>
                      <FiChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${searchDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Category Dropdown Menu */}
                    <AnimatePresence>
                      {searchDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 sm:w-64 lg:w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('');
                              setSearchDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-[#ffa509]/10 transition-colors ${
                              !selectedCategory ? 'bg-[#ffa509]/10 font-semibold text-[#050b2c]' : 'text-gray-900'
                            }`}
                            style={{ color: !selectedCategory ? '#050b2c' : '#111827' }}
                          >
                            All Categories
                          </button>
                          {categories.map((category) => (
                            <button
                              key={category._id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category.name);
                                setSearchDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-[#ffa509]/10 transition-colors ${
                                selectedCategory === category.name ? 'bg-[#ffa509]/10 font-semibold text-[#050b2c]' : 'text-gray-900'
                              }`}
                              style={{ color: selectedCategory === category.name ? '#050b2c' : '#111827' }}
                            >
                              {category.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 h-10 sm:h-12 px-2 sm:px-3 lg:px-4 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] text-gray-900 placeholder-gray-400 text-xs sm:text-sm bg-white"
                    style={{ color: '#111827' }}
                  />

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="h-10 sm:h-12 px-3 sm:px-4 lg:px-6 bg-[#ffa509] text-white rounded-r-lg hover:bg-[#ff8c00] transition-colors flex items-center justify-center"
                  >
                    <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Home Icon */}
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isActive('/')
                        ? 'bg-[#ffa509]/20 text-[#ffa509]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FiHome className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>

                {/* Cart Icon */}
                <Link href="/dashboard/cart">
                  <motion.div
                    data-cart-icon
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isActive('/dashboard/cart')
                        ? 'bg-[#ffa509]/20 text-[#ffa509]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {cartItemCount > 0 && (
                      <motion.span
                        data-cart-badge
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-[#050b2c]"
                      >
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>

                {/* Wishlist Icon */}
                <Link href="/dashboard/wishlist">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isActive('/dashboard/wishlist')
                        ? 'bg-[#ffa509]/20 text-[#ffa509]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>

                {/* Orders Icon */}
                <Link href="/dashboard/orders">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isActive('/dashboard/orders')
                        ? 'bg-[#ffa509]/20 text-[#ffa509]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FiPackage className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>

                {/* Profile Icon */}
                <Link href="/dashboard/profile">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-1.5 sm:p-2 rounded-lg transition-colors ${
                      isActive('/dashboard/profile')
                        ? 'bg-[#ffa509]/20 text-[#ffa509]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>

                {/* User Profile */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/dashboard/profile">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#ffa509] flex items-center justify-center text-white font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm"
                    >
                      {user?.firstName && user?.lastName
                        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                        : user?.email?.charAt(0).toUpperCase()}
                    </motion.div>
                  </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-3"
                >
                  Sign Out
                </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = '/login')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm px-2 sm:px-3"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (window.location.href = '/register')}
                  className="bg-[#ffa509] hover:bg-[#ff8c00] text-white border-none text-xs sm:text-sm px-2 sm:px-3"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </motion.button>
            </div>
          </div>

          {/* Navigation Links Row */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-3 border-t border-white/10 pt-2 sm:pt-3 pb-1 sm:pb-2">
            {/* Home Link */}
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/')
                    ? 'text-[#ffa509]'
                    : 'text-white hover:text-[#ffa509]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <FiHome className="w-4 h-4" />
                  <span className="font-medium text-sm xl:text-base">Home</span>
                  <FiChevronDown className="w-3 h-3" />
                </div>
                {isActive('/') && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffa509] rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>

            {/* Flash Sales Link */}
            <Link href="/flash-sales">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/flash-sales')
                    ? 'text-[#ffa509]'
                    : 'text-white hover:text-[#ffa509]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <FiZap className="w-4 h-4" />
                  </motion.div>
                  <span className="font-medium text-sm xl:text-base">Flash Sales</span>
                </div>
                {isActive('/flash-sales') && (
                  <motion.div
                    layoutId="activeIndicatorFlashSales"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffa509] rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>

            {/* All Categories Dropdown */}
            <div className="relative" ref={shopDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/products')
                    ? 'text-[#ffa509]'
                    : 'text-white hover:text-[#ffa509]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <FiShoppingBag className="w-4 h-4" />
                  <span className="font-medium text-sm xl:text-base">All Categories</span>
                  <motion.div
                    animate={{ rotate: shopDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown className="w-3 h-3" />
                  </motion.div>
                </div>
                {isActive('/products') && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffa509] rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>

              {/* Categories Dropdown */}
              <AnimatePresence>
                {shopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="max-h-96 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((category, index) => {
                          const Icon = getCategoryIcon(category.name);
                          return (
                            <motion.div
                              key={category._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                href={`/products?category=${encodeURIComponent(category.name)}`}
                                onClick={() => setShopDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffa509]/10 transition-colors group"
                              >
                                <Icon className="w-5 h-5 text-[#ffa509] group-hover:scale-110 transition-transform" />
                                <span className="flex-1 text-gray-700 font-medium group-hover:text-[#050b2c]">
                                  {category.name}
                                </span>
                                <FiChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
              </Link>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No categories available
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Links - Show at least 4 categories (up to 6 for better UX) */}
            {categories.slice(0, categories.length < 4 ? categories.length : Math.min(6, categories.length)).map((category) => {
              const Icon = getCategoryIcon(category.name);
              const categoryHref = `/products?category=${encodeURIComponent(category.name)}`;
              const currentCategory = searchParams?.get('category');
              const isCategoryActive = pathname === '/products' && 
                currentCategory === category.name;
              
              return (
                <Link key={category._id} href={categoryHref}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                      isCategoryActive
                        ? 'text-[#ffa509]'
                        : 'text-white hover:text-[#ffa509]'
                  }`}
                >
                    <div className="flex items-center gap-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm xl:text-base">{category.name}</span>
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                    {isCategoryActive && (
                      <motion.div
                        layoutId={`activeIndicator-${category._id}`}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffa509] rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-white/20 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {/* Home Link */}
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/')
                      ? 'bg-[#ffa509] text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <FiHome className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                  {/* Flash Sales Link */}
                  <Link
                    href="/flash-sales"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/flash-sales')
                        ? 'bg-[#ffa509] text-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <FiZap className="w-5 h-5" />
                    <span className="font-medium">Flash Sales</span>
                  </Link>

                {/* All Categories Link */}
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/products')
                      ? 'bg-[#ffa509] text-white'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <FiShoppingBag className="w-5 h-5" />
                  <span className="font-medium">All Categories</span>
                </Link>

                {/* Category Links - Show at least 4 categories (up to 6 for better UX) */}
                {categories.slice(0, categories.length < 4 ? categories.length : Math.min(6, categories.length)).map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  const categoryHref = `/products?category=${encodeURIComponent(category.name)}`;
                  const currentCategory = searchParams?.get('category');
                  const isCategoryActive = pathname === '/products' && 
                    currentCategory === category.name;
                  
                  return (
                    <Link
                      key={category._id}
                      href={categoryHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isCategoryActive
                          ? 'bg-[#ffa509] text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  );
                })}
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors relative"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span className="font-medium">Cart</span>
                      {cartItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
                        >
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </motion.span>
                      )}
                    </Link>
                    <Link
                      href="/dashboard/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                    >
                      <FiHeart className="w-5 h-5" />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive('/dashboard/orders')
                          ? 'bg-[#ffa509] text-white'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <FiPackage className="w-5 h-5" />
                      <span className="font-medium">Orders</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
                    >
                      <FiUser className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">Loading...</div>
          </div>
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  );
}
