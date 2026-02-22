'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { FiX, FiEye } from 'react-icons/fi';
import { IProduct } from '@/types/product';
import { useProduct } from '@/hooks/useProducts';
import ProductDetail from './ProductDetail';
import Loading from '@/components/ui/Loading';
import { formatCurrency } from '@/utils/currency';

interface QuickViewProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isFlashSale?: boolean;
}

export default function QuickView({ productId, isOpen, onClose, isFlashSale = false }: QuickViewProps) {
  const { product, isLoading, error } = useProduct(productId);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-[55] overflow-y-auto"
          >
            {/* Floating Close Button - Mobile Only (Always Visible) */}
            <button
              onClick={onClose}
              className="lg:hidden fixed top-20 sm:top-24 right-4 z-[60] p-3 bg-[#FDE8F0] rounded-full shadow-xl border border-gray-300 hover:bg-[#FC9BC2] active:bg-[#DB7093] transition-all flex items-center justify-center group text-[#000000]"
              aria-label="Close quick view"
            >
              <FiX className="w-6 h-6 text-[#000000] group-hover:text-white transition-colors" />
            </button>

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FiEye className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F]" />
                <h2 className="text-lg sm:text-xl font-bold text-[#000000]">Quick View</h2>
              </div>
              <button
                onClick={onClose}
                className="group p-2.5 sm:p-2.5 hover:bg-[#FDE8F0] active:bg-[#FC9BC2] rounded-full transition-colors flex-shrink-0 z-30 relative"
                aria-label="Close quick view"
              >
                <FiX className="w-6 h-6 sm:w-6 sm:h-6 text-[#000000] group-hover:text-[#F9629F]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <Loading size="lg" text="Loading product..." />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#FDE8F0] text-[#000000] border border-gray-300 rounded-lg hover:bg-[#FC9BC2] transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              ) : product ? (
                <div className="quick-view-container">
                  <ProductDetail product={product} isFlashSale={isFlashSale} hideProductName />
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

