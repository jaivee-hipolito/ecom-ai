'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PageTopBanner from '@/components/shared/PageTopBanner';
import { FiTruck, FiArrowUp } from 'react-icons/fi';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              <FiTruck className="w-10 h-10 text-[#000000]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            Shipping &amp; Delivery – Teezee
          </h1>
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
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              At Teezee, every piece is prepared with intention and care. From our hands to yours, we are committed to ensuring a seamless and secure delivery experience.
            </p>
          </motion.div>

          {/* Order Preparation */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">1</span>
              Order Preparation
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Each in-stock piece is carefully processed and dispatched within <strong>1–3 business days</strong>. During peak seasons or exclusive releases, additional time may be required to maintain our quality standards.
              </p>
              <p className="leading-relaxed">
                All packaging is thoughtfully completed within this timeframe to ensure your jewelry arrives beautifully presented and protected.
              </p>
            </div>
          </motion.section>

          {/* Shipping Within Canada */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">2</span>
              Shipping Within Canada
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                All orders are dispatched from Victoria, British Columbia and we currently ship Canada-wide.
              </p>
              <p className="leading-relaxed">
                Orders are processed and shipped on business days only.
              </p>
              <p className="leading-relaxed">
                Every shipment is sent via Canada Post and includes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 leading-relaxed">
                <li>$100 complimentary insurance coverage</li>
                <li>Tracking information, delivered via email or SMS</li>
                <li>Adult signature required upon delivery for added security</li>
              </ul>
              <p className="leading-relaxed">
                If no one is available at the time of delivery, Canada Post will leave a notice card with instructions for pickup at your nearest outlet. Government-issued photo ID will be required to collect your parcel.
              </p>
              <p className="leading-relaxed">
                Should you wish to purchase additional insurance coverage, please contact us prior to placing your order.
              </p>
              <p className="leading-relaxed">
                Please note that delivery timelines may be affected by national, provincial, or territorial holidays, as well as carrier-related delays beyond our control.
              </p>
            </div>
          </motion.section>

          {/* Order Changes */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">3</span>
              Order Changes
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Once an order has been dispatched, it cannot be modified or canceled.
              </p>
              <p className="leading-relaxed">
                If multiple orders are placed, we will gladly combine them when possible.
              </p>
            </div>
          </motion.section>

          {/* Address Details */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">4</span>
              Address Details
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                To ensure a smooth delivery, please provide a complete and accurate shipping address, including any apartment or unit numbers.
              </p>
              <p className="leading-relaxed">
                If a parcel is returned due to incomplete or incorrect address information, a reshipping fee will apply.
              </p>
            </div>
          </motion.section>

          {/* Delivery Concerns */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">5</span>
              Delivery Concerns
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                If your tracking indicates that your parcel has been delivered but you have not received it, please allow 72 hours and check with neighbors, your concierge, or your community mailbox before contacting us.
              </p>
              <p className="leading-relaxed">
                For security reasons, we are unable to offer refunds on parcels that have been signed for upon delivery.
              </p>
              <p className="leading-relaxed">
                Teezee is not responsible for packages lost due to incorrect shipping information provided at checkout.
              </p>
            </div>
          </motion.section>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="pt-6 border-t border-gray-200"
          >
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium">
              At Teezee, our goal is to provide a flawless, secure, and elevated delivery experience—ensuring your exquisite jewelry arrives safely and ready to be cherished.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-[#F9629F] font-semibold hover:text-[#FC9BC2] transition-colors"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] text-white rounded-full shadow-2xl shadow-[#F9629F]/50 flex items-center justify-center z-50 hover:shadow-[#F9629F]/70 transition-all"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-6 h-6" />
      </motion.button>

      <Footer />
    </div>
  );
}
