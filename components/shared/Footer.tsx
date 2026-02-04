'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
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
  FiArrowRight,
  FiSend,
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setIsSubmitting(false);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Products', href: '/products', icon: FiShoppingBag },
    { name: 'Flash Sales', href: '/flash-sales', icon: FiZap },
    { name: 'Categories', href: '/products', icon: FiPackage },
  ];

  const customerService = [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
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
    { name: 'Blog', href: '/blog' },
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
    'Visa', 'Mastercard', 'PayPal', 'Stripe', 'Apple Pay', 'Google Pay'
  ];

  return (
    <footer className="bg-gradient-to-br from-[#050b2c] via-[#0a1538] to-[#050b2c] text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-[#ffa509]/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#ffa509]/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info & Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <Link href="/" className="inline-block mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2"
                >
                  <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
                    <FiShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-black bg-gradient-to-r from-white to-[#ffa509] bg-clip-text text-transparent">
                    TeeZee
                  </span>
                </motion.div>
              </Link>
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                Your trusted destination for quality products. Shop with confidence and enjoy amazing deals every day.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <FiPhone className="w-4 h-4 text-[#ffa509] flex-shrink-0" />
                  <a href="tel:+1234567890" className="hover:text-[#ffa509] transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-sm">
                  <FiMail className="w-4 h-4 text-[#ffa509] flex-shrink-0" />
                  <a href="mailto:support@teezee.com" className="hover:text-[#ffa509] transition-colors">
                    support@teezee.com
                  </a>
                </div>
                <div className="flex items-start gap-3 text-white/80 text-sm">
                  <FiMapPin className="w-4 h-4 text-[#ffa509] flex-shrink-0 mt-0.5" />
                  <span>123 Shopping Street, Commerce City, CC 12345</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-6 text-[#ffa509]">Quick Links</h3>
              <ul className="space-y-3">
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
                        className="flex items-center gap-2 text-white/70 hover:text-[#ffa509] transition-colors group text-sm"
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
              <h3 className="text-lg font-bold mb-6 text-[#ffa509]">Customer Service</h3>
              <ul className="space-y-3">
                {customerService.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-[#ffa509] transition-colors text-sm flex items-center gap-2 group"
                    >
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter & Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-6 text-[#ffa509]">Stay Connected</h3>
              
              {/* Newsletter */}
              <div className="mb-8">
                <p className="text-white/70 text-sm mb-4">
                  Subscribe to get special offers and updates
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] text-sm"
                      required
                    />
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] px-4 py-2.5 rounded-lg text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : subscribed ? (
                        <FiSend className="w-5 h-5" />
                      ) : (
                        <FiSend className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  {subscribed && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#ffa509] text-xs font-medium"
                    >
                      ✓ Successfully subscribed!
                    </motion.p>
                  )}
                </form>
              </div>

              {/* Account Links (if authenticated) */}
              {isAuthenticated && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white/90">My Account</h4>
                  <ul className="space-y-2">
                    {accountLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-white/70 hover:text-[#ffa509] transition-colors text-xs flex items-center gap-2 group"
                        >
                          <FiArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          <span>{link.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Company Info Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 pt-3 pb-3 border-t border-b border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
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
                    className="text-white/60 hover:text-[#ffa509] transition-colors text-xs"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
              className="flex items-center gap-4"
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
              className="flex flex-col items-center md:items-end gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <FiShield className="w-4 h-4 text-[#ffa509]" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <FiTruck className="w-4 h-4 text-[#ffa509]" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <FiCreditCard className="w-4 h-4 text-[#ffa509]" />
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
                    className="px-2 py-1 bg-white/10 rounded text-[10px] text-white/60"
                  >
                    {method}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
