'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiTag, FiArrowLeft, FiPlusCircle, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import CategoryForm from '@/components/admin/CategoryForm';

export default function CreateCategoryPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/categories');
    router.refresh();
  };

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
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Link
                  href="/admin/categories"
                  className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 transition-all inline-flex"
                >
                  <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </Link>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 sm:p-3 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                  >
                    <FiPlusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </motion.div>
                  <span>Create New Category</span>
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-lg">
                  Add a new product category with custom attributes
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20 flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                <FiInfo className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F] flex-shrink-0" />
                <div>
                  <p className="text-[10px] sm:text-xs text-white/70">Quick Tip</p>
                  <p className="text-xs sm:text-sm font-semibold">Add attributes to customize products</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <CategoryForm onSuccess={handleSuccess} />
        </div>
      </motion.div>
    </div>
  );
}

