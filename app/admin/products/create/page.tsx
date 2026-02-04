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
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-[#ffa509]">➕</span>
                Create New Product
              </h1>
              <p className="text-white/80 text-lg">
                Add a new product to your catalog
              </p>
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

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 lg:p-10"
      >
        <ProductForm onSuccess={handleSuccess} />
      </motion.div>
    </div>
  );
}
