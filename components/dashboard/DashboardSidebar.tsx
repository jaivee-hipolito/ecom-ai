'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSettings,
  FiChevronRight,
  FiChevronDown,
  FiArrowLeft,
  FiLogOut,
} from 'react-icons/fi';
import { signOut } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Overview', 'Orders', 'Shopping', 'Account'])
  );

  // Update content padding when sidebar collapses/expands (desktop only)
  useEffect(() => {
    const content = document.getElementById('dashboard-content');
    if (content && window.innerWidth >= 1024) {
      content.style.paddingLeft = isCollapsed ? '5rem' : '16rem';
    } else if (content) {
      content.style.paddingLeft = '0';
    }
    
    const handleResize = () => {
      if (content) {
        if (window.innerWidth >= 1024) {
          content.style.paddingLeft = isCollapsed ? '5rem' : '16rem';
        } else {
          content.style.paddingLeft = '0';
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  const isActive = (href: string) => {
    // Handle exact matches first
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // Handle home page - must be exact match
    if (href === '/') {
      return pathname === '/';
    }
    // For other paths, check if pathname starts with href
    return pathname.startsWith(href);
  };

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const handleSignOut = () => {
    setIsMobileOpen(false);
    signOut({ callbackUrl: '/' });
  };

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Home',
          href: '/',
          icon: <FiHome className="w-5 h-5" />,
        },
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: <FiHome className="w-5 h-5" />,
        },
      ],
      collapsible: false,
    },
    {
      title: 'Orders',
      items: [
        {
          name: 'My Orders',
          href: '/dashboard/orders',
          icon: <FiShoppingBag className="w-5 h-5" />,
        },
      ],
      collapsible: true,
    },
    {
      title: 'Shopping',
      items: [
        {
          name: 'Products',
          href: '/dashboard/products',
          icon: <FiPackage className="w-5 h-5" />,
        },
        {
          name: 'Cart',
          href: '/dashboard/cart',
          icon: <FiShoppingCart className="w-5 h-5" />,
        },
        {
          name: 'Wishlist',
          href: '/dashboard/wishlist',
          icon: <FiHeart className="w-5 h-5" />,
        },
      ],
      collapsible: true,
    },
    {
      title: 'Account',
      items: [
        {
          name: 'Profile',
          href: '/dashboard/profile',
          icon: <FiUser className="w-5 h-5" />,
        },
        {
          name: 'Settings',
          href: '/dashboard/settings',
          icon: <FiSettings className="w-5 h-5" />,
        },
      ],
      collapsible: true,
    },
  ];

  return (
    <>
      {/* Sidebar - mobile menu bar (Teezee Dashboard + hamburger) removed on mobile/tablet/smaller screens per owner request */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '5rem' : '16rem',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 z-[70] h-screen transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-gradient-to-b from-[#000000] via-[#1a1a1a] to-[#000000] text-white shadow-2xl w-64 lg:w-auto`}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,165,9,0.1),transparent_50%)] pointer-events-none"></div>

          {/* Logo and Toggle */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-[#F9629F]/20 relative z-10">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/dashboard" className="text-xl font-bold text-white flex items-center gap-2 group">
                    <svg className="w-6 h-6 text-[#F9629F] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div>
                      <div className="text-white">Teezee</div>
                      <div className="text-xs text-[#F9629F] font-semibold">My Dashboard</div>
                    </div>
                  </Link>
                </motion.div>
              )}
              {isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center w-full"
                >
                  <svg className="w-6 h-6 text-[#F9629F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-[#F9629F] hover:bg-[#F9629F]/20 transition-colors relative z-10"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5 rotate-90" />}
            </motion.button>
          </div>

          {/* User Info */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4 border-b border-[#F9629F]/20 relative z-10"
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#F9629F]/10 to-transparent border border-[#F9629F]/20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] flex items-center justify-center text-[#000000] font-bold text-lg shadow-lg"
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                      : user?.email?.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'User'}
                    </p>
                    <p className="text-xs text-[#F9629F]/80 truncate">{user?.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-4 border-b border-[#F9629F]/20 flex justify-center relative z-10"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] flex items-center justify-center text-[#000000] font-bold text-lg shadow-lg"
                >
                  {user?.firstName && user?.lastName
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                    : user?.email?.charAt(0).toUpperCase()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3 relative z-10 custom-scrollbar">
            {navSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.title);
              const hasActiveItem = section.items.some((item) => isActive(item.href));

              if (section.collapsible && section.items.length > 1) {
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.05 }}
                  >
                    {!isCollapsed && (
                      <motion.button
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSection(section.title)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#F9629F] uppercase tracking-wider hover:text-[#FC9BC2] transition-colors"
                      >
                        <span>{section.title}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronDown className="w-4 h-4" />
                        </motion.div>
                      </motion.button>
                    )}
                    {isCollapsed ? (
                      <ul className="space-y-2">
                        {section.items.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <li key={item.name}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                  href={item.href}
                                  onClick={() => setIsMobileOpen(false)}
                                  className={`flex items-center justify-center px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                                    active
                                      ? 'bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg shadow-[#F9629F]/30'
                                      : 'text-white/70 hover:bg-[#F9629F]/10 hover:text-white'
                                  }`}
                                  title={item.name}
                                >
                                  {item.icon}
                                </Link>
                              </motion.div>
                            </li>
                          );
                        })}
                        {/* Sign Out Button - Only show in Account section when collapsed */}
                        {section.title === 'Account' && (
                          <li>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all text-white/70 hover:bg-red-500/20 hover:text-red-400"
                                title="Sign Out"
                              >
                                <FiLogOut className="w-5 h-5" />
                              </button>
                            </motion.div>
                          </li>
                        )}
                      </ul>
                    ) : (
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 mt-2"
                          >
                            {section.items.map((item) => {
                              const active = isActive(item.href);
                              return (
                                <li key={item.name}>
                                  <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                      href={item.href}
                                      onClick={() => setIsMobileOpen(false)}
                                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                        active
                                          ? 'bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg shadow-[#F9629F]/30'
                                          : 'text-white/70 hover:bg-[#F9629F]/10 hover:text-white'
                                      }`}
                                    >
                                      <span className="mr-3">{item.icon}</span>
                                      <span>{item.name}</span>
                                    </Link>
                                  </motion.div>
                                </li>
                              );
                            })}
                            {/* Sign Out Button - Only show in Account section */}
                            {section.title === 'Account' && (
                              <li>
                                <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                  <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all text-white/70 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30"
                                  >
                                    <span className="mr-3">
                                      <FiLogOut className="w-5 h-5" />
                                    </span>
                                    <span>Sign Out</span>
                                  </button>
                                </motion.div>
                              </li>
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              }

              // Non-collapsible sections
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.05 }}
                >
                  {!isCollapsed && (
                    <h3 className="px-3 text-xs font-bold text-[#F9629F] uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isItemExpanded = expandedSections.has(item.name);
                      const active = isActive(item.href) || (hasSubItems && item.subItems?.some((subItem) => isActive(subItem.href)));

                      if (hasSubItems) {
                        return (
                          <li key={item.name}>
                            {!isCollapsed ? (
                              <>
                                <motion.button
                                  whileHover={{ x: 5 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleSection(item.name);
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                                    active
                                      ? 'bg-[#F9629F]/20 text-white border border-[#F9629F]/30'
                                      : 'text-white/70 hover:bg-[#F9629F]/10 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.name}</span>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: isItemExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FiChevronDown className="w-4 h-4" />
                                  </motion.div>
                                </motion.button>
                                <AnimatePresence>
                                  {isItemExpanded && (
                                    <motion.ul
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="ml-6 mt-1 space-y-1"
                                    >
                                      {item.subItems?.map((subItem) => {
                                        const subActive = isActive(subItem.href);
                                        return (
                                          <li key={subItem.name}>
                                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                              <Link
                                                href={subItem.href}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                                                  subActive
                                                    ? 'bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg shadow-[#F9629F]/30'
                                                    : 'text-white/60 hover:bg-[#F9629F]/10 hover:text-white'
                                                }`}
                                              >
                                                <span className="mr-3">{subItem.icon}</span>
                                                <span>{subItem.name}</span>
                                              </Link>
                                            </motion.div>
                                          </li>
                                        );
                                      })}
                                    </motion.ul>
                                  )}
                                </AnimatePresence>
                              </>
                            ) : (
                              <div className="space-y-1">
                                {item.subItems?.map((subItem) => {
                                  const subActive = isActive(subItem.href);
                                  return (
                                    <motion.div key={subItem.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Link
                                        href={subItem.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`flex items-center justify-center px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                                          subActive
                                            ? 'bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg shadow-[#F9629F]/30'
                                            : 'text-white/70 hover:bg-[#F9629F]/10 hover:text-white'
                                        }`}
                                        title={subItem.name}
                                      >
                                        {subItem.icon}
                                      </Link>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            )}
                          </li>
                        );
                      }

                      // Regular item without subItems
                      return (
                        <li key={item.name}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.03 }}
                            whileHover={{ x: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={`flex items-center ${
                                isCollapsed
                                  ? 'justify-center px-3 py-3'
                                  : 'px-4 py-2.5'
                              } text-sm font-medium rounded-xl transition-all ${
                                active
                                  ? 'bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg shadow-[#F9629F]/30'
                                  : 'text-white/70 hover:bg-[#F9629F]/10 hover:text-white'
                              }`}
                              title={isCollapsed ? item.name : undefined}
                            >
                              <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                              {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`px-${isCollapsed ? '2' : '6'} py-4 border-t border-[#F9629F]/20 relative z-10`}>
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className={`flex items-center text-sm text-white/70 hover:text-[#F9629F] transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Back to Store' : undefined}
              >
                <FiArrowLeft className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
                {!isCollapsed && <span>Back to Store</span>}
              </Link>
            </motion.div>
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 165, 9, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 165, 9, 0.3);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 165, 9, 0.5);
          }
        `}</style>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
