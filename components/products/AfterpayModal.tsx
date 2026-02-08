'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiHeart, FiMonitor, FiUser, FiCheck, FiPieChart } from 'react-icons/fi';

interface AfterpayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AfterpayModal({ isOpen, onClose }: AfterpayModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#e0f7fa] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative px-8 py-8 pb-6">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6 text-gray-900" />
                </button>

                {/* Logo and Tagline */}
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 lowercase text-3xl">afterpay</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-900"
                    >
                      <path
                        d="M12 4L14 8L18 9L14 10L12 14L10 10L6 9L10 8L12 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center leading-tight">
                    Shop now. Pay later.
                    <br />
                    <span className="text-2xl lg:text-3xl">Always interest-free.</span>
                  </h2>
                </div>

                {/* How It Works - Four Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Step 1: Add to Cart */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center mb-4 shadow-lg">
                      <div className="relative">
                        <FiShoppingBag className="w-10 h-10 text-gray-900" />
                        <FiHeart className="w-5 h-5 text-gray-900 absolute -top-1 -right-1" />
                      </div>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm leading-relaxed">
                      Add your favourites to cart
                    </p>
                  </motion.div>

                  {/* Step 2: Select Afterpay */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center mb-4 shadow-lg">
                      <div className="relative">
                        <FiMonitor className="w-10 h-10 text-gray-900" />
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-900 absolute bottom-0 right-0"
                        >
                          <path
                            d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm leading-relaxed">
                      Select Afterpay at checkout
                    </p>
                  </motion.div>

                  {/* Step 3: Account & Approval */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center mb-4 shadow-lg">
                      <div className="relative">
                        <FiMonitor className="w-8 h-8 text-gray-900" />
                        <FiUser className="w-5 h-5 text-gray-900 absolute bottom-1 left-1/2 transform -translate-x-1/2" />
                        <FiCheck className="w-4 h-4 text-gray-900 absolute top-0 right-0 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm leading-relaxed">
                      Log into or create your Afterpay account, instant approval decision
                    </p>
                  </motion.div>

                  {/* Step 4: Payment Split */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center mb-4 shadow-lg">
                      <FiPieChart className="w-10 h-10 text-gray-900" />
                    </div>
                    <p className="text-gray-900 font-semibold text-sm leading-relaxed">
                      Your purchase will be split into 4 payments, payable every 2 weeks
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Footer/Legal Information */}
              <div className="px-8 py-6 bg-white/50 border-t-2 border-gray-200">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">
                    You must be of the age of majority in your province or territory, a resident of Canada, and meet additional eligibility criteria to qualify. Estimated payment amounts shown on product pages include a 6% BNPL processing fee. Taxes and shipping charges are added at checkout. For complete terms see{' '}
                    <a
                      href="https://www.afterpay.com/en-CA/instalment-agreement"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 hover:text-[#ffa509] underline font-semibold transition-colors"
                    >
                      Instalment Agreement
                    </a>
                    .
                  </p>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-semibold">
                      ⚠️ Note: A 6% BNPL processing fee will be added to your order total when using Afterpay.
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 text-center pt-2">
                    © 2020 Afterpay Canada
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
