'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

interface KlarnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

export default function KlarnaModal({ isOpen, onClose, price }: KlarnaModalProps) {
  // Calculate payment plans
  const payIn4Amount = price / 4;
  const payInFullAmount = price;

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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: '#ffb3c7' }}>
                    <span className="font-bold text-white text-sm">Klarna</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6 text-gray-900" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Title and Subtitle */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Pay at your own pace</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    As you shop and pay with Klarna, the amount you can spend with Klarna may increase.
                  </p>
                </div>

                {/* Example Plans */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Example plans</h3>
                  
                  {/* Pay in 4 */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-1">Pay in 4</p>
                        <p className="text-lg font-bold text-gray-900 mb-1">
                          {formatCurrency(payIn4Amount)} every 2 weeks
                        </p>
                        <p className="text-xs text-green-600 font-medium">$0.00 interest</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total {formatCurrency(price)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pay in full */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-1">Pay in full</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(payInFullAmount)} today
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total {formatCurrency(price)}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* How it works */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">How it works</h3>
                  
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-gray-900 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          At checkout select{' '}
                          <span className="px-2 py-1 rounded text-white text-xs font-bold" style={{ backgroundColor: '#ffb3c7' }}>
                            Klarna
                          </span>
                        </p>
                      </div>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-gray-900 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Choose your payment plan
                        </p>
                        <p className="text-xs text-gray-600">
                          Different payment plans may be shown depending on the purchase amount and credit score.
                        </p>
                      </div>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-gray-900 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Complete your checkout
                        </p>
                        <p className="text-xs text-gray-600">
                          The amount will be charged based on the payment plan you chose.
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Disclaimer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-2"
                  >
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Down payment may be required. Payment plans are subject to eligibility. See{' '}
                      <a
                        href="https://www.klarna.com/us/terms-and-conditions/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-[#F9629F] underline font-semibold transition-colors"
                      >
                        terms & conditions
                      </a>
                      .
                    </p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 font-semibold">
                        ⚠️ Note: A 6% BNPL processing fee will be added to your order total when using Klarna.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Footer - Close Button */}
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 hover:bg-[#FC9BC2] font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

