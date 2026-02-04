'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { FiX, FiEye } from 'react-icons/fi';
import { IProduct } from '@/types/product';
import { useProduct } from '@/hooks/useProducts';
import ProductDetail from './ProductDetail';
import Loading from '@/components/ui/Loading';

interface QuickViewProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({ productId, isOpen, onClose }: QuickViewProps) {
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
            className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiEye className="w-5 h-5 text-[#ffa509]" />
                <h2 className="text-xl font-bold text-[#050b2c]">Quick View</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close quick view"
              >
                <FiX className="w-6 h-6 text-gray-600" />
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
                    className="px-6 py-2 bg-[#050b2c] text-white rounded-lg hover:bg-[#050b2c]/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : product ? (
                <div className="quick-view-container">
                  <ProductDetail product={product} />
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

