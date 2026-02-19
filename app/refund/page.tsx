'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { FiShield, FiArrowUp } from 'react-icons/fi';
import Link from 'next/link';

export default function RefundPolicyPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

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
              <FiShield className="w-10 h-10 text-[#000000]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            Refund Policy
          </h1>
          <p className="text-center text-white/80 text-lg sm:text-xl">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              At <span className="font-bold text-[#000000]">Teezee</span>, we are committed to delivering premium-quality gold jewelry crafted with precision and care. Due to the nature and value of our products, all purchases are considered final sale. We kindly ask that you review the following policy carefully before completing your order.
            </p>
          </motion.div>

          {/* Section 1 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">1</span>
              Final Sale Policy
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                All items are sold as final sale. We do not accept returns, exchanges, or refunds under any circumstances, including but not limited to sizing concerns, changes of mind, or personal preference.
              </p>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">2</span>
              Quality Assurance
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Each piece undergoes a thorough inspection prior to shipment to ensure it meets our strict quality standards. We guarantee that your item will arrive in the condition described at the time of purchase.
              </p>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">3</span>
              Order Accuracy
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Once an order has been placed, it cannot be canceled, modified, or refunded. Please ensure all details — including sizing, specifications, and shipping information — are accurate before finalizing your purchase.
              </p>
            </div>
          </motion.section>

          {/* Section 4 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">4</span>
              Shipping Damage Claims
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                If your item arrives damaged due to shipping, you must provide a clear and continuous unboxing video as proof. Claims submitted without video evidence will not be considered. All damage-related claims are reviewed on a case-by-case basis.
              </p>
            </div>
          </motion.section>

          {/* Section 5 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">5</span>
              Customer Support
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                While we do not offer returns or exchanges, our team is happy to assist with any questions prior to purchase. For inquiries, please contact us at{' '}
                <a href="mailto:teezeejewelry.official@gmail.com" className="font-semibold text-[#F9629F] hover:text-[#FC9BC2] transition-colors">teezeejewelry.official@gmail.com</a>
                {' '}or through our official{' '}
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#F9629F] hover:text-[#FC9BC2] underline transition-colors"
                >
                  Facebook page
                </a>.
              </p>
            </div>
          </motion.section>

          {/* Section 6 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">6</span>
              Legal Notice
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                By completing a purchase with Teezee, you acknowledge and agree to this Refund Policy. This policy forms part of our Terms and Conditions and is legally binding. Teezee reserves the right to update or modify this policy at any time without prior notice. Customers are responsible for reviewing the policy before making a purchase.
              </p>
            </div>
          </motion.section>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="pt-6 border-t border-gray-200"
          >
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium">
              Thank you for choosing Teezee. We value your trust and look forward to providing you with exceptional jewelry.
            </p>
            <Link
              href="/terms"
              className="inline-block mt-6 text-[#F9629F] font-semibold hover:text-[#FC9BC2] transition-colors"
            >
              ← Back to Terms & Conditions
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5 }}
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
