'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import PageTopBanner from '@/components/shared/PageTopBanner';
import { FiHelpCircle, FiArrowUp } from 'react-icons/fi';
import Link from 'next/link';

export default function FAQPage() {
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
              <FiHelpCircle className="w-10 h-10 text-[#000000]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-center text-white/80 text-lg sm:text-xl">
            Quick answers about shopping, payments, and shipping
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
          {/* Shop Now Pay Later Guide — single section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">1</span>
              Shop Now Pay Later Guide
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴊᴇᴡᴇʟʀʏ ɪɴᴠᴇꜱᴛᴍᴇɴᴛ ᴛᴏᴅᴀʏ ᴀɴᴅ ᴘᴀʏ ᴏᴠᴇʀ ᴛɪᴍᴇ ᴡɪᴛʜ ꜰʟᴇxɪʙʟᴇ ɪɴꜱᴛᴀʟʟᴍᴇɴᴛ ᴏᴘᴛɪᴏɴꜱ. ᴄʜᴏᴏꜱᴇ ꜰʀᴏᴍ ᴛʀᴜꜱᴛᴇᴅ ᴘʀᴏᴠɪᴅᴇʀꜱ ɪɴᴄʟᴜᴅɪɴɢ ᴀꜰꜰɪʀᴍ, ᴋʟᴀʀɴᴀ ᴀɴᴅ ᴀꜰᴛᴇʀᴘᴀʏ—ᴍᴀᴋɪɴɢ ɪᴛ ᴇᴀꜱʏ ᴛᴏ ꜱʜᴏᴘ ɴᴏᴡ ᴀɴᴅ ᴘᴀʏ ʟᴀᴛᴇʀ ᴡɪᴛʜ ᴄᴏɴꜰɪᴅᴇɴᴄᴇ.
            </p>

            {/* BNPL Providers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <div className="relative w-28 h-10">
                    <Image
                      src="/payment/affirm-logo.svg"
                      alt="Affirm"
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Pay in 4 or monthly installments. Split your purchase into manageable payments with no hidden fees.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <div className="relative w-28 h-10">
                    <Image
                      src="/payment/klarna-logo.svg"
                      alt="Klarna"
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Pay in 4 interest-free installments. Flexible financing options at checkout.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-center mb-3">
                  <div className="relative w-28 h-10">
                    <Image
                      src="/payment/afterpay-logo.svg"
                      alt="Afterpay"
                      fill
                      className="object-contain object-center"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  Pay in 4 interest-free payments. Buy now and pay over two months with no interest.
                </p>
              </motion.div>
            </div>

            {/* How to Select Your Preferred Payment Option at Checkout */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#000000] mb-4 mt-8">
              How to Select Your Preferred Payment Option at Checkout
            </h3>
            <div className="space-y-6 ml-0 sm:ml-4">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4"
              >
                <span className="inline-flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9629F]/20 text-[#000000] font-bold text-sm">1</span>
                <div>
                  <h4 className="font-bold text-[#000000] mb-1">Add to Cart</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Select your desired jewelry piece and proceed to checkout.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 }}
                className="flex gap-4"
              >
                <span className="inline-flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9629F]/20 text-[#000000] font-bold text-sm">2</span>
                <div>
                  <h4 className="font-bold text-[#000000] mb-1">Enter Shipping Information</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Provide your full name, shipping address, and contact details.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
              >
                <span className="inline-flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9629F]/20 text-[#000000] font-bold text-sm">3</span>
                <div>
                  <h4 className="font-bold text-[#000000] mb-1">Choose Your Payment Method</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    At the payment stage, you will see available Buy Now, Pay Later options such as Afterpay, Klarna, or Affirm. Select your preferred provider to continue.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="flex gap-4"
              >
                <span className="inline-flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9629F]/20 text-[#000000] font-bold text-sm">4</span>
                <div>
                  <h4 className="font-bold text-[#000000] mb-1">Sign In or Create an Account</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Log in to your chosen payment provider, or create an account to confirm your installment plan eligibility.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4"
              >
                <span className="inline-flex w-8 h-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F9629F]/20 text-[#000000] font-bold text-sm">5</span>
                <div>
                  <h4 className="font-bold text-[#000000] mb-1">Complete Your Purchase</h4>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Once your order is confirmed, your jewelry will be prepared for immediate shipment, while your payments are conveniently scheduled over time.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Important Considerations */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#000000] mb-4 mt-8">
              Important Considerations
            </h3>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              Approval and spending thresholds are established at the sole discretion of your selected payment provider. For comprehensive terms, conditions, and eligibility details, we invite you to review the provider&apos;s official website.
            </p>
          </motion.section>

          {/* Is Payment Secure? */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">2</span>
              Is Payment Secure?
            </h2>
            <div className="ml-14 space-y-4">
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                At Teezee, safeguarding your privacy and personal information is of the utmost importance. Our website is protected by advanced Secure Socket Layer (SSL) encryption technology, ensuring that all data transmitted online remains secure. You can verify a protected connection by the padlock symbol in your browser and a URL beginning with &ldquo;https&rdquo;.
              </p>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                Teezee is verified by TrustedSite, reflecting our adherence to rigorous security standards and our commitment to maintaining a safe and confidential shopping environment. Your information remains securely encrypted between your browser and our servers at all times.
              </p>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                All transactions processed through Afterpay, Klarna, Affirm are handled via Stripe compliant payment infrastructure, providing industry-leading protection against unauthorized access. Teezee does not store your payment details on our servers. Sensitive information is securely encrypted and managed exclusively by trusted third-party payment providers.
              </p>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                We continuously monitor our platform and implement advanced security protocols to protect against potential threats.
              </p>
            </div>
          </motion.section>

          {/* Care and Responsibility Advisory */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">3</span>
              Care and Responsibility Advisory
            </h2>
            <div className="ml-14 space-y-4">
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                At Teezee, we take pride in offering jewelry of exceptional craftsmanship, sourced from the most esteemed artisans and trusted suppliers. Each piece is meticulously curated to meet the highest standards of quality and refinement.
              </p>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                We kindly remind our customer that the care and maintenance of your jewelry remain the responsibility of its owner. Teezee cannot assume liability for any damage resulting from improper handling, including bending, scratching, or breakage—especially in delicate or lightweight gold pieces.
              </p>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                To ensure your collection retains its brilliance and enduring elegance, we recommend handling each item with the utmost care and storing it in a secure, appropriate environment. By observing these practices, you safeguard the timeless beauty of your jewelry for generations to come.
              </p>
            </div>
          </motion.section>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="pt-6 border-t border-gray-200"
          >
            <Link
              href="/"
              className="inline-block text-[#F9629F] font-semibold hover:text-[#FC9BC2] transition-colors"
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
