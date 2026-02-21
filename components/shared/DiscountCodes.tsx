'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

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
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] relative overflow-hidden lg:overflow-visible">
      {/* Animated Background Blobs - visible on md+ for professional mobile */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
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
        {/* Section Header - compact & professional on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-5 sm:mb-8 lg:mb-10"
        >
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#F9629F] mb-1 sm:mb-2">
            Member Offers
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-2">
            🎉 Exclusive Discount Codes
          </h2>
          <p className="text-white/80 text-xs sm:text-sm lg:text-base max-w-xl mx-auto">
            Unlock savings with our special codes. Copy and apply at checkout.
          </p>
        </motion.div>

        {/* Discount Cards Grid - code-focused professional layout */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {discountCodes.map((discount, index) => {
            const isCopied = copiedCode === discount.code;

            return (
              <motion.div
                key={discount.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group"
              >
                <div className="relative bg-gray-800/90 sm:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-600/50 sm:border-gray-600/60 hover:border-gray-500/70 transition-all duration-200 h-full flex flex-col">
                  {/* Discount Amount */}
                  <div className="mb-2 sm:mb-3">
                    {discount.isFixedAmount ? (
                      <>
                        <span className="text-[#F9629F] font-bold text-lg sm:text-xl lg:text-2xl">${discount.discount}</span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-1">OFF</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#F9629F] font-bold text-lg sm:text-xl lg:text-2xl">{discount.discount}%</span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-1">OFF</span>
                      </>
                    )}
                  </div>
                  {/* Code Section - hero */}
                  <div className="mb-3 sm:mb-4">
                    <p className="text-gray-400 text-[10px] sm:text-xs mb-1 uppercase tracking-wider">Code</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-[#F9629F] font-bold text-sm sm:text-base lg:text-lg tracking-wider font-mono truncate flex-1">
                        {discount.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(discount.code)}
                        className={`shrink-0 p-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                          isCopied
                            ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-400'
                            : 'bg-transparent border-gray-500/80 text-gray-400 hover:border-gray-400 hover:text-white'
                        }`}
                        aria-label={`Copy ${discount.code}`}
                      >
                        {isCopied ? (
                          <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <FiCopy className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-gray-400 mt-auto">
                    {discount.minPurchase && (
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>Min. ${discount.minPurchase}</span>
                      </div>
                    )}
                    {discount.validUntil && (
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>Valid until {new Date(discount.validUntil).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

