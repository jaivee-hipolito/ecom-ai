'use client';

import { motion } from 'framer-motion';
import { FiTag, FiLayers, FiGrid } from 'react-icons/fi';
import CategoryTable from '@/components/admin/CategoryTable';

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Vibrant Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ffa509]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl shadow-lg"
                >
                  <FiTag className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Category Management
                  </h1>
                  <p className="text-white/80 text-lg flex items-center gap-2">
                    <FiLayers className="w-5 h-5" />
                    Organize and manage your product categories
                  </p>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <FiGrid className="w-6 h-6 text-[#ffa509]" />
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

