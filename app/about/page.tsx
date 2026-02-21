'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PageTopBanner from '@/components/shared/PageTopBanner';
import { FiHeart, FiMapPin, FiMail, FiAward, FiShield, FiTruck, FiFacebook } from 'react-icons/fi';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <PageTopBanner />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] py-16 sm:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F9629F]/50"
            >
              <FiHeart className="w-10 h-10 text-[#000000]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            About Teezee
          </h1>
          <p className="text-center text-white/80 text-lg sm:text-xl">
            Handcrafted jewelry, crafted with love
          </p>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12"
        >
          {/* Our Story */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#F9629F] rounded-lg flex items-center justify-center text-white font-bold">1</span>
              Our Story
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Welcome to <span className="font-bold text-[#000000]">Teezee</span>, your destination for beautiful, handcrafted jewelry. Based in Victoria, British Columbia, we are passionate about creating pieces that celebrate life&apos;s special moments.
              </p>
              <p>
                Every piece we offer is selected with care, bringing together quality craftsmanship and timeless design. Whether you&apos;re looking for a gift for someone special or a treat for yourself, we aim to make your shopping experience delightful.
              </p>
            </div>
          </motion.section>

          {/* What We Offer */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#F9629F] rounded-lg flex items-center justify-center text-white font-bold">2</span>
              What We Offer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5">
                <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F] rounded-lg flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#000000] mb-2">Quality First</h3>
                  <p className="text-gray-700 text-sm">
                    We partner with trusted suppliers to bring you durable, beautiful jewelry you can enjoy for years.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5">
                <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F] rounded-lg flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#000000] mb-2">Secure Shopping</h3>
                  <p className="text-gray-700 text-sm">
                    Your data and payments are protected with industry-standard security.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5">
                <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F] rounded-lg flex items-center justify-center">
                  <FiTruck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#000000] mb-2">Reliable Shipping</h3>
                  <p className="text-gray-700 text-sm">
                    We deliver with care so your jewelry arrives in perfect condition.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5">
                <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F] rounded-lg flex items-center justify-center">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#000000] mb-2">Customer Care</h3>
                  <p className="text-gray-700 text-sm">
                    We&apos;re here to help with any questions before and after your purchase.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-[#F9629F] rounded-lg flex items-center justify-center text-white font-bold">3</span>
              Get in Touch
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                We&apos;d love to hear from you. Reach out anytime for support, feedback, or wholesale inquiries.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a
                  href="mailto:teezeejewelry.official@gmail.com"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#F9629F] transition-colors"
                >
                  <FiMail className="w-5 h-5" />
                  <span>teezeejewelry.official@gmail.com</span>
                </a>
                <a
                  href="https://www.facebook.com/TeezeeFacebookPage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-[#F9629F] transition-colors"
                >
                  <FiFacebook className="w-5 h-5" />
                  <span>Facebook page</span>
                </a>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMapPin className="w-5 h-5 flex-shrink-0" />
                  <span>Victoria, British Columbia, Canada</span>
                </div>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#F9629F]/30 transition-all"
              >
                Shop Now
              </Link>
            </div>
          </motion.section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
