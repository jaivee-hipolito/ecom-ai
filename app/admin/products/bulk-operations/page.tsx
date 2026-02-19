'use client';

import { motion } from 'framer-motion';
import { FiLayers, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import BulkOperations from '@/components/admin/BulkOperations';

export default function BulkOperationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section — compact on mobile/tablet */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#0a1a4a] to-[#000000] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-indigo-500/50 flex-shrink-0"
                >
                  <FiLayers className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2">
                    Bulk Product Operations
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-lg flex items-center gap-1.5 sm:gap-2">
                    <FiEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#F9629F] flex-shrink-0" />
                    Update multiple products at once
                  </p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 max-w-full"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F9629F] rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-white/90 font-medium text-xs sm:text-sm">
                  Select multiple products and apply changes in bulk
                </span>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto px-3 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back to Products
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bulk Operations Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <BulkOperations />
      </motion.div>
    </div>
  );
}

