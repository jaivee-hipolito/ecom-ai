'use client';

import { motion } from 'framer-motion';
import { FiTag, FiLayers, FiGrid } from 'react-icons/fi';
import CategoryTable from '@/components/admin/CategoryTable';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Vibrant Header Section — compact on mobile/tablet */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-[#F9629F]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="min-w-0 flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-3 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                >
                  <FiTag className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2">
                    Category Management
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-lg flex items-center gap-1.5 sm:gap-2">
                    <FiLayers className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                    Organize and manage your product categories
                  </p>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
            >
              <div className="p-2 sm:p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#F9629F]" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Category Table Component */}
      <CategoryTable />
    </div>
  );
}

