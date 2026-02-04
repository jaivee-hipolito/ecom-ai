'use client';

import { motion } from 'framer-motion';
import { FiLayers, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import BulkOperations from '@/components/admin/BulkOperations';

export default function BulkOperationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-500/50"
                >
                  <FiLayers className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Bulk Product Operations
                  </h1>
                  <p className="text-white/80 text-lg flex items-center gap-2">
                    <FiEdit className="w-5 h-5 text-[#ffa509]" />
                    Update multiple products at once
                  </p>
                </div>
              </div>
              
              {/* Info Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="w-2 h-2 bg-[#ffa509] rounded-full animate-pulse"></div>
                <span className="text-white/90 font-medium text-sm">
                  Select multiple products and apply changes in bulk
                </span>
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <FiArrowLeft className="w-5 h-5" />
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

