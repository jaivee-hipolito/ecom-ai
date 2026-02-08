'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';
import AfterpayModal from './AfterpayModal';
import KlarnaModal from './KlarnaModal';

interface BNPLInstallmentsProps {
  price: number;
}

export default function BNPLInstallments({ price }: BNPLInstallmentsProps) {
  const [isAfterpayModalOpen, setIsAfterpayModalOpen] = useState(false);
  const [isKlarnaModalOpen, setIsKlarnaModalOpen] = useState(false);
  
  // Calculate 6% BNPL fee (admin wants customer to shoulder this charge)
  const BNPL_FEE_RATE = 0.06; // 6%
  const bnplFee = price * BNPL_FEE_RATE;
  const priceWithFee = price + bnplFee;
  
  // Calculate installment amounts (based on price with fee)
  // Afterpay: 4 interest-free payments
  const afterpayInstallment = priceWithFee / 4;
  
  // Klarna: 4 payments or monthly (we'll show 4 payments)
  const klarnaInstallment = priceWithFee / 4;
  const klarnaMonthly = priceWithFee / 4; // Same as 4 payments for simplicity

  // Only show if price is at least $50 (minimum for most BNPL providers)
  if (price < 50) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4 pt-4"
    >
      {/* Afterpay */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <span className="text-sm text-gray-600">
          or 4 interest-free payments of{' '}
          <span className="font-semibold text-gray-900">{formatCurrency(afterpayInstallment)}</span>
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-[#b2fce4] hover:bg-[#9ef5d8] rounded-lg transition-all flex items-center gap-2 text-sm font-medium text-gray-900 border border-[#7ee8c0] shadow-sm"
        >
          <span className="font-semibold lowercase">afterpay</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-900"
          >
            <path
              d="M8 2L10 6L14 7L10 8L8 12L6 8L2 7L6 6L8 2Z"
              fill="currentColor"
            />
          </svg>
        </motion.button>
        <button
          onClick={() => setIsAfterpayModalOpen(true)}
          className="text-sm text-gray-600 hover:text-[#ffa509] underline transition-colors cursor-pointer"
        >
          Learn More
        </button>
      </motion.div>

      {/* Klarna */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: '#ffb3c7' }}
          >
            Klarna
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              From <span className="font-bold text-gray-900">{formatCurrency(klarnaMonthly)}/month</span>, or 4 payments with Klarna
            </p>
            <button
              onClick={() => setIsKlarnaModalOpen(true)}
              className="text-sm text-gray-600 hover:text-[#ffa509] underline transition-colors mt-1 inline-block cursor-pointer"
            >
              Learn more
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="flex items-start gap-2 text-xs text-gray-500 pt-2"
      >
        <FiInfo className="w-4 h-4 mt-0.5 text-[#ffa509] flex-shrink-0" />
        <p>
          Available at checkout. Subject to approval. Terms apply. Available for orders over $50.
        </p>
      </motion.div>

      {/* Afterpay Modal */}
      <AfterpayModal
        isOpen={isAfterpayModalOpen}
        onClose={() => setIsAfterpayModalOpen(false)}
      />

      {/* Klarna Modal */}
      <KlarnaModal
        isOpen={isKlarnaModalOpen}
        onClose={() => setIsKlarnaModalOpen(false)}
        price={priceWithFee}
      />
    </motion.div>
  );
}

