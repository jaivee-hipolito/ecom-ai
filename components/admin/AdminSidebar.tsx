'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiBarChart2,
  FiPackage,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiChevronRight,
  FiChevronDown,
  FiMenu,
  FiX,
  FiArrowLeft,
  FiPlus,
  FiList,
  FiAlertCircle,
  FiEdit,
  FiDownload,
  FiEye,
  FiTruck,
  FiLogOut,
} from 'react-icons/fi';

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

interface AdminSidebarProps {
  hideOnMobile?: boolean;
}

export default function AdminSidebar({ hideOnMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Orders section is collapsed by default - only Overview, Products, and Analytics are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Overview', 'Products', 'Analytics'])
  );

  // Update content padding when sidebar collapses/expands
  useEffect(() => {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const updatePadding = () => {
      // Don't set padding on mobile if sidebar is hidden
      if (hideOnMobile && window.innerWidth < 1024) {
        content.style.paddingLeft = '0';
      } else if (window.innerWidth >= 1024) {
        // Only set padding on desktop
        content.style.paddingLeft = isCollapsed ? '5rem' : '16rem';
      } else {
        // Mobile without hideOnMobile - no padding
        content.style.paddingLeft = '0';
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    
    return () => {
      window.removeEventListener('resize', updatePadding);
    };
  }, [isCollapsed, hideOnMobile]);

  const isActive = (href: string, isSubItem: boolean = false) => {
    // Always check exact match first
    if (pathname === href) {
      return true;
    }
    
    // For sub-items, only exact match
    if (isSubItem) {
      return false;
    }
    
    // For dashboard, only exact match
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    
    // For parent items, check if pathname starts with href
    // But ensure it's not matching a sub-route (e.g., /admin/products should NOT match /admin/products/create)
    if (pathname.startsWith(href)) {
      // Check if there's more path after href (indicating a sub-route)
      const remainingPath = pathname.slice(href.length);
      // If remaining path is empty or starts with '?' (query params), it's a match
      // If remaining path starts with '/', it's a sub-route, so don't match
      return remainingPath === '' || remainingPath.startsWith('?');
    }
    
    return false;
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
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: <FiHome className="w-5 h-5" />,
        },
      ],
      collapsible: false,
    },
    {
      title: 'Analytics',
      items: [
        {
          name: 'Sales Analytics',
          href: '/admin/analytics/sales',
          icon: <FiBarChart2 className="w-5 h-5" />,
          subItems: [
            {
              name: 'Sales Dashboard',
              href: '/admin/analytics/sales',
              icon: <FiBarChart2 className="w-4 h-4" />,
            },
            {
              name: 'Best Selling',
              href: '/admin/analytics/best-selling',
              icon: <FiTrendingUp className="w-4 h-4" />,
            },
            {
              name: 'Worst Selling',
              href: '/admin/analytics/worst-selling',
              icon: <FiTrendingUp className="w-4 h-4" />,
            },
          ],
        },
      ],
      collapsible: true,
    },
    {
      title: 'Catalog',
      items: [
        {
          name: 'Products',
          href: '/admin/products',
          icon: <FiPackage className="w-5 h-5" />,
          subItems: [
            {
              name: 'Add Product',
              href: '/admin/products/create',
              icon: <FiPlus className="w-4 h-4" />,
            },
            {
              name: 'All Products',
              href: '/admin/products',
              icon: <FiList className="w-4 h-4" />,
            },
            {
              name: 'Out of Stock',
              href: '/admin/products/out-of-stock',
              icon: <FiAlertCircle className="w-4 h-4" />,
            },
            {
              name: 'Bulk Operations',
              href: '/admin/products/bulk-operations',
              icon: <FiEdit className="w-4 h-4" />,
            },
            {
              name: 'Import/Export',
              href: '/admin/products/import-export',
              icon: <FiDownload className="w-4 h-4" />,
            },
            {
              name: 'Most Viewed',
              href: '/admin/products/most-viewed',
              icon: <FiEye className="w-4 h-4" />,
            },
          ],
        },
        {
          name: 'Categories',
          href: '/admin/categories',
          icon: <FiTag className="w-5 h-5" />,
          subItems: [
            {
              name: 'Add Category',
              href: '/admin/categories/create',
              icon: <FiPlus className="w-4 h-4" />,
            },
            {
              name: 'All Categories',
              href: '/admin/categories',
              icon: <FiList className="w-4 h-4" />,
            },
          ],
        },
      ],
      collapsible: false,
    },
    {
      title: 'Orders',
      items: [
        {
          name: 'All Orders',
          href: '/admin/orders',
          icon: <FiShoppingBag className="w-5 h-5" />,
        },
        {
          name: 'Deliveries',
          href: '/admin/deliveries',
          icon: <FiTruck className="w-5 h-5" />,
        },
      ],
      collapsible: true,
    },
    {
      title: 'Users',
      items: [
        {
          name: 'All Users',
          href: '/admin/users',
          icon: <FiUsers className="w-5 h-5" />,
          subItems: [
            {
              name: 'Add User',
              href: '/admin/users/add',
              icon: <FiPlus className="w-4 h-4" />,
            },
            {
              name: 'All Users',
              href: '/admin/users',
              icon: <FiList className="w-4 h-4" />,
            },
          ],
        },
      ],
      collapsible: true,
    },
  ];

  return (
    <>
      {/* Mobile menu button - hidden on users page */}
      {!hideOnMobile && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#050b2c] to-[#0a1a4a] border-b border-[#ffa509]/20 px-4 py-3 flex items-center justify-between shadow-lg"
        >
          <Link href="/admin/dashboard" className="text-xl font-bold text-white flex items-center gap-2 cursor-pointer">
            <svg className="w-5 h-5 text-[#ffa509]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Teezee</span>
            <span className="text-sm text-[#ffa509]">Admin</span>
          </Link>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg text-white hover:bg-[#ffa509]/20 transition-colors cursor-pointer"
          >
            {isMobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </motion.button>
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '5rem' : '16rem',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          hideOnMobile ? 'hidden lg:block' : isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-gradient-to-b from-[#050b2c] via-[#0a1a4a] to-[#050b2c] text-white shadow-2xl`}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,165,9,0.1),transparent_50%)] pointer-events-none"></div>

          {/* Logo and Toggle */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-[#ffa509]/20 relative z-10">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/admin/dashboard" className="text-xl font-bold text-white flex items-center gap-2 group cursor-pointer">
                    <svg className="w-6 h-6 text-[#ffa509] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div>
                      <div className="text-white">Teezee</div>
                      <div className="text-xs text-[#ffa509] font-semibold">Admin Panel</div>
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
                  <svg className="w-6 h-6 text-[#ffa509]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-[#ffa509] hover:bg-[#ffa509]/20 transition-colors relative z-10 cursor-pointer"
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
                className="px-6 py-4 border-b border-[#ffa509]/20 relative z-10"
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#ffa509]/10 to-transparent border border-[#ffa509]/20">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ffa509] to-[#ffb833] flex items-center justify-center text-[#050b2c] font-bold text-lg shadow-lg"
                  >
                    {user?.firstName && user?.lastName
                      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                      : user?.email?.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'Admin'}
                    </p>
                    <p className="text-xs text-[#ffa509]/80 truncate">{user?.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-4 border-b border-[#ffa509]/20 flex justify-center relative z-10"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ffa509] to-[#ffb833] flex items-center justify-center text-[#050b2c] font-bold text-lg shadow-lg"
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
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#ffa509] uppercase tracking-wider hover:text-[#ffb833] transition-colors cursor-pointer"
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
                                  className={`flex items-center justify-center px-3 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                                    active
                                      ? 'bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] shadow-lg shadow-[#ffa509]/30'
                                      : 'text-white/70 hover:bg-[#ffa509]/10 hover:text-white'
                                  }`}
                                  title={item.name}
                                >
                                  {item.icon}
                                </Link>
                              </motion.div>
                            </li>
                          );
                        })}
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
                                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                                        active
                                          ? 'bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] shadow-lg shadow-[#ffa509]/30'
                                          : 'text-white/70 hover:bg-[#ffa509]/10 hover:text-white'
                                      }`}
                                    >
                                      <span className="mr-3">{item.icon}</span>
                                      <span>{item.name}</span>
                                    </Link>
                                  </motion.div>
                                </li>
                              );
                            })}
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
                    <h3 className="px-3 text-xs font-bold text-[#ffa509] uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                  )}
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isItemExpanded = expandedSections.has(item.name);
                      // Check if any sub-item is active
                      const hasActiveSubItem = hasSubItems && item.subItems?.some((subItem) => isActive(subItem.href, true));
                      // Parent is active only if it's an exact match AND no sub-item is active
                      const active = (pathname === item.href && !hasActiveSubItem) || hasActiveSubItem;

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
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                                    active
                                      ? 'bg-[#ffa509]/20 text-white border border-[#ffa509]/30'
                                      : 'text-white/70 hover:bg-[#ffa509]/10 hover:text-white'
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
                                        const subActive = isActive(subItem.href, true); // true indicates it's a sub-item
                                        return (
                                          <li key={subItem.name}>
                                            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                                              <Link
                                                href={subItem.href}
                                                onClick={() => setIsMobileOpen(false)}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                                                  subActive
                                                    ? 'bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] shadow-lg shadow-[#ffa509]/30'
                                                    : 'text-white/60 hover:bg-[#ffa509]/10 hover:text-white'
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
                                  const subActive = isActive(subItem.href, true); // true indicates it's a sub-item
                                  return (
                                    <motion.div key={subItem.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Link
                                        href={subItem.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`flex items-center justify-center px-3 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                                          subActive
                                            ? 'bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] shadow-lg shadow-[#ffa509]/30'
                                            : 'text-white/70 hover:bg-[#ffa509]/10 hover:text-white'
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
                              className={`flex items-center cursor-pointer ${
                                isCollapsed
                                  ? 'justify-center px-3 py-3'
                                  : 'px-4 py-2.5'
                              } text-sm font-medium rounded-xl transition-all ${
                                active
                                  ? 'bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] shadow-lg shadow-[#ffa509]/30'
                                  : 'text-white/70 hover:bg-[#ffa509]/10 hover:text-white'
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

            {/* Sign Out Button - Mobile/iPad Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navSections.length * 0.05 }}
              className="lg:hidden mt-4 pt-4 border-t border-[#ffa509]/20"
            >
              <motion.button
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all bg-gradient-to-r from-[#ffa509]/20 to-[#ffb833]/20 text-white/90 hover:text-white hover:from-[#ffa509]/30 hover:to-[#ffb833]/30 border border-[#ffa509]/30 hover:border-[#ffa509]/50 shadow-lg shadow-[#ffa509]/10 hover:shadow-[#ffa509]/20 cursor-pointer"
              >
                <span className="mr-3">
                  <FiLogOut className="w-5 h-5 text-[#ffa509]" />
                </span>
                <span>Sign Out</span>
              </motion.button>
            </motion.div>
          </nav>

          {/* Footer */}
          <div className={`px-${isCollapsed ? '2' : '6'} py-4 border-t border-[#ffa509]/20 relative z-10`}>
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className={`flex items-center text-sm text-white/70 hover:text-[#ffa509] transition-colors cursor-pointer ${
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
        {isMobileOpen && !hideOnMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
