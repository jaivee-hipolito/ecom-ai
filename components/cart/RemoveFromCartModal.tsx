'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { FiShoppingCart, FiX } from 'react-icons/fi';

interface RemoveFromCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  productName: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function RemoveFromCartModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isLoading = false,
  error = null,
}: RemoveFromCartModalProps) {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center"
          aria-labelledby="remove-from-cart-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#F9629F] via-[#DB7093] to-[#FDE8F0]" />

            <div className="p-6 sm:p-8">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Icon + content */}
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 20 }}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center border-2 border-red-100"
                >
                  <FiShoppingCart className="w-7 h-7 text-red-500" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3
                    id="remove-from-cart-title"
                    className="text-lg font-bold text-gray-900 mb-1"
                  >
                    Remove from cart?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium text-gray-800">&ldquo;{productName}&rdquo;</span> will be removed from your cart. You can add it back anytime.
                  </p>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Keep in cart
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onConfirm()}
                  isLoading={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'Removing…' : 'Remove from cart'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
