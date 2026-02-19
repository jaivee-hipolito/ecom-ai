'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCopy, FiCheck, FiTag, FiZap, FiGift } from 'react-icons/fi';

interface DiscountCode {
  code: string;
  discount: number;
  description: string;
  validUntil?: string;
  minPurchase?: number;
  icon?: 'tag' | 'zap' | 'gift';
  isFixedAmount?: boolean; // true for dollar amounts, false for percentages
}

const discountCodes: DiscountCode[] = [
  {
    code: 'SAVE10',
    discount: 10,
    description: 'Get $10 off on all products',
    validUntil: '2026-12-30',
    minPurchase: 50,
    icon: 'tag',
    isFixedAmount: true,
  },
  {
    code: 'FLASH10',
    discount: 10,
    description: 'Flash sale! $10 off selected items',
    validUntil: '2026-12-30',
    minPurchase: 100,
    icon: 'zap',
    isFixedAmount: true,
  },
  {
    code: 'NEWUSER10',
    discount: 10,
    description: 'New customers get $10 off',
    validUntil: '2026-12-30',
    minPurchase: 50,
    icon: 'gift',
    isFixedAmount: true,
  },
];

const iconMap = {
  tag: FiTag,
  zap: FiZap,
  gift: FiGift,
};

export default function DiscountCodes() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-[#F9629F]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-[#F9629F]/5 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <div className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] p-3 rounded-full">
              <FiGift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            🎉 Exclusive Discount Codes
          </h2>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Unlock amazing savings with our special discount codes. Copy and apply at checkout!
          </p>
        </motion.div>

        {/* Discount Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {discountCodes.map((discount, index) => {
            const IconComponent = iconMap[discount.icon || 'tag'];
            const isCopied = copiedCode === discount.code;

            return (
              <motion.div
                key={discount.code}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-[#F9629F]/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  {/* Icon Badge */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#F9629F] to-[#DB7093] mb-4 shadow-lg"
                  >
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>

                  {/* Discount Amount */}
                  <div className="mb-3">
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: 'spring', stiffness: 200, delay: index * 0.1 + 0.2 }}
                      className="inline-block text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent"
                    >
                      ${discount.discount}
                    </motion.span>
                    <span className="text-white/60 text-lg sm:text-xl ml-2">OFF</span>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm sm:text-base mb-4 font-medium">
                    {discount.description}
                  </p>

                  {/* Code Section */}
                  <div className="bg-[#000000]/50 rounded-lg p-3 sm:p-4 mb-4 border border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white/60 text-xs sm:text-sm mb-1">Discount Code</p>
                        <motion.code
                          className="text-[#F9629F] font-bold text-lg sm:text-xl lg:text-2xl tracking-wider font-mono"
                          whileHover={{ scale: 1.05 }}
                        >
                          {discount.code}
                        </motion.code>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(discount.code)}
                        className={`p-2 sm:p-3 rounded-lg transition-all duration-300 border-2 ${
                          isCopied
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : 'bg-[#FDE8F0] border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#FC9BC2]'
                        }`}
                        aria-label={`Copy ${discount.code}`}
                      >
                        {isCopied ? (
                          <FiCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <FiCopy className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs sm:text-sm">
                    {discount.minPurchase && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span>💰</span>
                        <span>Min. purchase: ${discount.minPurchase}</span>
                      </div>
                    )}
                    {discount.validUntil && (
                      <div className="flex items-center gap-2 text-white/70">
                        <span>⏰</span>
                        <span>Valid until: {new Date(discount.validUntil).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <motion.a
            href="/products"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base lg:text-lg shadow-lg hover:bg-[#FC9BC2] hover:shadow-xl transition-all duration-300"
          >
            Shop Now & Save! 🛒
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

