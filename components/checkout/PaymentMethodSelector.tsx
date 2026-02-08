'use client';

import { motion } from 'framer-motion';
import { FiCreditCard } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

export type PaymentMethod = 'card' | 'afterpay' | 'klarna';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  total: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  total,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
        <p className="text-sm text-gray-600">All transactions are secure and encrypted.</p>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Credit Card */}
        <motion.button
          whileHover={{ backgroundColor: selectedMethod === 'card' ? '#f9fafb' : '#f9fafb' }}
          onClick={() => onMethodChange('card')}
          className={`w-full flex items-center justify-between p-4 border-b border-gray-200 transition-colors ${
            selectedMethod === 'card' ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'card' 
                ? 'border-[#050b2c] bg-[#050b2c]' 
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'card' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">Credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600">VISA</span>
            <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">MC</span>
            </div>
          </div>
        </motion.button>

        {/* Afterpay */}
        <motion.button
          whileHover={{ backgroundColor: selectedMethod === 'afterpay' ? '#f9fafb' : '#f9fafb' }}
          onClick={() => onMethodChange('afterpay')}
          className={`w-full flex items-center justify-between p-4 border-b border-gray-200 transition-colors ${
            selectedMethod === 'afterpay' ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'afterpay' 
                ? 'border-[#050b2c] bg-[#050b2c]' 
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'afterpay' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">Afterpay</span>
          </div>
          <div className="px-3 py-1.5 bg-[#b2fce4] rounded-lg flex items-center gap-1">
            <span className="font-bold text-gray-900 lowercase text-xs">afterpay</span>
            <svg
              width="12"
              height="12"
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
          </div>
        </motion.button>

        {/* Klarna */}
        <motion.button
          whileHover={{ backgroundColor: selectedMethod === 'klarna' ? '#f9fafb' : '#f9fafb' }}
          onClick={() => onMethodChange('klarna')}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            selectedMethod === 'klarna' ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === 'klarna' 
                ? 'border-[#050b2c] bg-[#050b2c]' 
                : 'border-gray-300'
            }`}>
              {selectedMethod === 'klarna' && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">Klarna - Flexible payments</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg flex items-center" style={{ backgroundColor: '#ffb3c7' }}>
            <span className="font-bold text-white text-xs">Klarna</span>
          </div>
        </motion.button>
      </div>

      {/* Selected Method Info */}
      {selectedMethod === 'afterpay' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              Select Afterpay in the payment form below to pay in 4 interest-free installments. You'll be redirected to Afterpay to complete your payment.
            </p>
            {/* Installment amounts - total already includes 6% fee */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">4 interest-free payments of:</p>
              <p className="text-lg font-bold text-[#050b2c]">
                {formatCurrency(total / 4)}
                <span className="text-xs text-gray-500 ml-1 font-normal">(includes 6% BNPL fee)</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Total: {formatCurrency(total)}</p>
            </div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-semibold">
              ⚠️ A 6% BNPL processing fee is included in the total amount above.
            </p>
          </div>
        </motion.div>
      )}

      {selectedMethod === 'klarna' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              You'll be redirected to Klarna to complete your purchase.
            </p>
            {/* Installment amounts - total already includes 6% fee */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-1">4 payments of:</p>
              <p className="text-lg font-bold text-[#050b2c]">
                {formatCurrency(total / 4)}
                <span className="text-xs text-gray-500 ml-1 font-normal">(includes 6% BNPL fee)</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Total: {formatCurrency(total)}</p>
            </div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-semibold">
              ⚠️ A 6% BNPL processing fee is included in the total amount above.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

