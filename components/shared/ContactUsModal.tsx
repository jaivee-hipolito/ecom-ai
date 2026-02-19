'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiMapPin, FiFacebook, FiShoppingBag } from 'react-icons/fi';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Contact Us</h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    aria-label="Close modal"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 lg:p-10">
                {/* Grid: Teezee + Email | Phone | Location on wider screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch">
                  {/* Teezee Company */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5 rounded-xl p-5 lg:p-6 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <div className="w-12 h-12 bg-[#F9629F] rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                      <FiShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#000000] mb-0.5">Teezee</h3>
                    <p className="text-gray-600 text-sm">Downtown Victoria BC</p>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5 rounded-xl p-5 lg:p-6 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <div className="w-12 h-12 bg-[#F9629F] rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                      <FiMail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#000000] mb-1">Email</h3>
                    <a href="mailto:teezeejewelry.official@gmail.com" className="text-gray-700 hover:text-[#F9629F] transition-colors text-sm break-all">
                      teezeejewelry.official@gmail.com
                    </a>
                  </motion.div>

                  {/* Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5 rounded-xl p-5 lg:p-6 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <div className="w-12 h-12 bg-[#F9629F] rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                      <FiPhone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#000000] mb-1">Phone</h3>
                    <a href="tel:+12504094574" className="text-gray-700 hover:text-[#F9629F] transition-colors text-sm">
                      +1 (250) 409-4574
                    </a>
                  </motion.div>

                  {/* Location */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5 rounded-xl p-5 lg:p-6 flex flex-col items-center justify-center text-center min-h-[140px]"
                  >
                    <div className="w-12 h-12 bg-[#F9629F] rounded-full flex items-center justify-center mb-3 flex-shrink-0">
                      <FiMapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#000000] mb-1">Location</h3>
                    <p className="text-gray-700 text-sm">Victoria, British Columbia, Canada</p>
                  </motion.div>
                </div>

                {/* Facebook - full width */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 lg:mt-6 bg-gradient-to-br from-[#000000]/5 to-[#F9629F]/5 rounded-xl p-5 lg:p-6 flex items-center justify-center gap-3 text-center"
                >
                  <div className="w-12 h-12 bg-[#F9629F] rounded-full flex items-center justify-center flex-shrink-0">
                    <FiFacebook className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-700 text-sm lg:text-base">
                    Need help right away? Connect with our team through our official{' '}
                    <a
                      href="https://www.facebook.com/TeezeeFacebookPage/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F9629F] hover:text-[#FC9BC2] font-semibold underline transition-colors"
                    >
                      Facebook page
                    </a>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
