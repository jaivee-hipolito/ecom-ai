'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiZap,
  FiPackage,
  FiShoppingCart,
  FiCreditCard,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import ContactUsModal from './ContactUsModal';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Products', href: '/products', icon: FiShoppingBag },
    { name: 'Deal of the Day', href: '/deal-of-the-day', icon: FiZap },
    { name: 'Categories', href: '/products', icon: FiPackage },
  ];

  const customerService = [
    { name: 'Contact Us', href: '#', isModal: true },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/refund' },
    { name: 'Track Order', href: '/orders' },
  ];

  const accountLinks = [
    { name: 'My Account', href: '/dashboard/profile' },
    { name: 'Orders', href: '/dashboard/orders' },
    { name: 'Wishlist', href: '/dashboard/wishlist' },
    { name: 'Cart', href: '/dashboard/cart' },
  ];

  const companyInfo = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, href: 'https://facebook.com', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: FiTwitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: FiInstagram, href: 'https://instagram.com', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: FiYoutube, href: 'https://youtube.com', color: 'hover:text-red-500' },
    { name: 'LinkedIn', icon: FiLinkedin, href: 'https://linkedin.com', color: 'hover:text-blue-600' },
  ];

  const paymentMethods = [
    'Visa', 'Mastercard', 'Stripe', 'Klarna', 'Affirm', 'Afterpay'
  ];

  return (
    <footer className="bg-[#0a0a0f] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - 3 columns */}
        <div className="py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-[#F9629F]">Quick Links</h3>
              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                      >
                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span>{link.name}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-[#F9629F]">Customer Service</h3>
              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                {customerService.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {(link as any).isModal ? (
                      <button
                        onClick={() => setIsContactModalOpen(true)}
                        className="text-white/60 hover:text-white transition-colors text-sm w-full text-left"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Stay Connected */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-[#F9629F]">Stay Connected</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                  {accountLinks.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-white/60 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
            </motion.div>
          </div>

          {/* Company Info Links - 3 cols on mobile for compact browsing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 sm:mt-6 pt-3 pb-3 border-t border-b border-white/10"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {companyInfo.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-xs"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar - compact on mobile */}
        <div className="border-t border-white/10 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/60 text-xs sm:text-sm text-center md:text-left"
            >
              © {currentYear} TeeZee. All rights reserved.
            </motion.p>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center"
            >
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-white/60 ${social.color} transition-colors`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </motion.div>

            {/* Payment Methods & Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center md:items-end gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                <div className="flex items-center gap-1 text-white/60 text-[10px] sm:text-xs">
                  <FiShield className="w-4 h-4 text-white/80" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-[10px] sm:text-xs">
                  <FiTruck className="w-4 h-4 text-white/80" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-[10px] sm:text-xs">
                  <FiCreditCard className="w-4 h-4 text-white/80" />
                  <span>Easy Payment</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/60"
                  >
                    {method}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Us Modal */}
      <ContactUsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </footer>
  );
}
