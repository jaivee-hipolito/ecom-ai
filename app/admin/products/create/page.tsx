'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import ProductForm from '@/components/admin/ProductForm';

export default function CreateProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/products');
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
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-[#F9629F]">➕</span>
                Create New Product
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-lg">
                Add a new product to your catalog
              </p>
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

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10"
      >
        <ProductForm onSuccess={handleSuccess} />
      </motion.div>
    </div>
  );
}
