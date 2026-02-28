'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductSearch } from '@/hooks/useProducts';
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
  FiLogOut,
  FiArrowRight,
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
  const { cart } = useCart();
  const cartItemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { results: searchResults, isLoading: isSearching } = useProductSearch(searchInput);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (!showLogoModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogoModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showLogoModal]);

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

  // Close shop dropdown and search box when clicking outside
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
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowSearchBox(false);
      }
    };

    if (shopDropdownOpen || searchDropdownOpen || categoriesDropdownOpen || showSearchBox) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shopDropdownOpen, searchDropdownOpen, categoriesDropdownOpen, showSearchBox]);

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
      <nav className="bg-[#000000] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-[#F9629F]/20 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-[#F9629F]/20 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav 
        className="bg-white shadow-md fixed left-0 right-0 top-0 z-50"
        style={{ margin: 0, padding: 0, width: '100%', maxWidth: '100%' }}
      >
      <div ref={searchBoxRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Menu Bar - Hamburger | Logo | Search & Cart */}
          <div className="grid grid-cols-3 items-center h-24 lg:h-28 xl:h-32 py-2 relative">
            {/* Left Section - Hamburger Menu (z-20 so it stays clickable above center logo on widescreen) */}
            <div className="relative z-20 flex justify-start">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#000000] hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Menu"
              >
                <FiMenu className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Center Section - Brand Logo (click opens brand modal) */}
            <div className="flex justify-center z-10 w-full min-w-0">
              <motion.button
                type="button"
                onClick={() => setShowLogoModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative h-20 w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 rounded-full overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#F9629F]/40 focus:ring-offset-2"
                aria-label="View Teezee brand"
              >
                <Image
                  src="/teezee-logo.png"
                  alt="Teezee - Adorn Yourself With The Radiance Of 18K Gold"
                  width={256}
                  height={256}
                  className="h-full w-full object-cover"
                  priority
                  suppressHydrationWarning
                />
              </motion.button>
            </div>

            {/* Right Section - Search & Cart */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 relative">
              {/* Search Icon - Toggles search box */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearchBox(!showSearchBox)}
                className={`p-2 rounded-lg transition-colors ${showSearchBox ? 'bg-gray-100 text-[#ffa509]' : 'text-[#000000] hover:bg-gray-100'}`}
                aria-label="Search products"
              >
                <FiSearch className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>

              {/* Cart Icon with Badge */}
              <Link href={isAuthenticated ? "/dashboard/cart" : "/login"}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 rounded-lg text-[#000000] hover:bg-gray-100 transition-colors"
                >
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <motion.span
                      data-cart-badge
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Search Box — appears when magnifying glass is clicked */}
          <AnimatePresence>
            {showSearchBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-visible border-t border-gray-100 bg-white"
              >
                <div className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="relative max-w-2xl mx-auto">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setShowSearchBox(false);
                            if (e.key === 'Enter') {
                              if (searchInput.trim()) {
                                router.push(`/products?search=${encodeURIComponent(searchInput.trim())}`);
                                setSearchInput('');
                                setShowSearchBox(false);
                              }
                            }
                          }}
                          className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509]/30 focus:border-[#ffa509] transition-all text-[#050b2c] placeholder:text-gray-500 font-medium"
                          autoFocus
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSearchBox(false)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 shrink-0"
                        aria-label="Close search"
                      >
                        <FiX className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Search suggestions overlay — products only */}
                    {searchInput.trim().length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[85vh] overflow-hidden z-[9999]"
                      >
                        <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                          {isSearching ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">Searching...</div>
                          ) : searchResults.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">No products found</div>
                          ) : (
                            <div className="py-2">
                              {searchResults.map((product: { _id?: string; name: string; price: number; coverImage?: string; images?: string[] }) => (
                                <Link
                                  key={product._id}
                                  href={`/products/${product._id}`}
                                  onClick={() => {
                                    setSearchInput('');
                                    setShowSearchBox(false);
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffa509]/5 transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {(product.coverImage || product.images?.[0]) ? (
                                      <img
                                        src={product.coverImage || product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <FiPackage className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                    <p className="text-sm font-medium text-[#050b2c]">${Number(product.price).toFixed(2)}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Bottom bar: Search for "query" + arrow */}
                        <Link
                          href={`/products?search=${encodeURIComponent(searchInput.trim())}`}
                          onClick={() => {
                            setSearchInput('');
                            setShowSearchBox(false);
                          }}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            Search for &quot;{searchInput.trim()}&quot;
                          </span>
                          <FiArrowRight className="w-5 h-5 text-[#ffa509]" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* Mobile / Hamburger Menu — visible on all screen sizes when open */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 overflow-hidden bg-white"
            >
              <div className="py-4 space-y-2">
                {/* Home Link */}
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/')
                      ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                      : 'text-[#000000] hover:bg-[#FDE8F0]/50'
                  }`}
                >
                  <FiHome className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                  {/* Deal of the Day Link - Hidden on mobile/tablet */}
                  <div className="hidden">
                    <Link
                      href="/deal-of-the-day"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive('/deal-of-the-day')
                          ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                          : 'text-[#000000] hover:bg-[#FDE8F0]/50'
                      }`}
                    >
                      <FiZap className="w-5 h-5" />
                      <span className="font-medium">Deal of the Day</span>
                    </Link>
                  </div>

                {/* All Categories Link */}
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/products')
                      ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                      : 'text-[#000000] hover:bg-[#FDE8F0]/50'
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
                          ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                          : 'text-[#000000] hover:bg-[#FDE8F0]/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  );
                })}
                {!isAuthenticated && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/login')
                        ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                        : 'text-[#000000] hover:bg-[#FDE8F0]/50'
                    }`}
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                )}
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard/cart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#000000] hover:bg-gray-100 transition-colors relative"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span className="font-medium">Cart</span>
                      {cartItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
                        >
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </motion.span>
                      )}
                    </Link>
                    <Link
                      href="/dashboard/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#000000] hover:bg-gray-100 transition-colors"
                    >
                      <FiHeart className="w-5 h-5" />
                      <span className="font-medium">Wishlist</span>
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive('/dashboard/orders')
                          ? 'bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300'
                          : 'text-[#000000] hover:bg-[#FDE8F0]/50'
                      }`}
                    >
                      <FiPackage className="w-5 h-5" />
                      <span className="font-medium">Orders</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#000000] hover:bg-gray-100 transition-colors"
                    >
                      <FiUser className="w-5 h-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-[#000000] hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100 mt-2 pt-4"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>

      {/* Brand logo modal - professional quick view */}
      <AnimatePresence>
        {showLogoModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowLogoModal(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="brand-modal-title"
            >
              <div
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 sm:p-8 text-center">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden border-2 border-[#F9629F]/20 shadow-lg mb-5">
                    <Image
                      src="/teezee-logo.png"
                      alt="Teezee"
                      width={640}
                      height={640}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h2 id="brand-modal-title" className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] mb-1">
                    Teezee
                  </h2>
                  <p className="text-sm sm:text-base text-[#6b5b3a] font-medium mb-1">
                    Adorn yourself with the radiance of the gold
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">
                    Your destination for exquisite jewelry
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setShowLogoModal(false);
                        router.push('/');
                      }}
                      className="bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-white hover:opacity-95 shadow-md flex items-center justify-center text-center w-full sm:w-auto"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Explore <FiArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowLogoModal(false)}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoModal(false)}
                  className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content starts below the fixed nav */}
      <div
        className="flex-shrink-0 h-24 lg:h-28 xl:h-32"
        aria-hidden="true"
      />
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
