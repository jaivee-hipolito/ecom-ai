'use client';

import { motion } from 'framer-motion';
import { FiAlertCircle, FiPackage, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import ProductTable from '@/components/admin/ProductTable';

export default function OutOfStockProductsPage() {
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
                  className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/50"
                >
                  <FiAlertCircle className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Out of Stock Products
                  </h1>
                  <p className="text-white/80 text-lg flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-[#ffa509]" />
                    View and manage products that need restocking
                  </p>
                </div>
              </div>
              
              {/* Alert Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 font-medium text-sm">
                  Action Required: These products need immediate attention
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

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: FiAlertCircle,
            title: 'Critical Alert',
            description: 'Products with zero stock',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            textDark: 'text-red-900',
          },
          {
            icon: FiPackage,
            title: 'Restock Needed',
            description: 'Update inventory levels',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            textDark: 'text-orange-900',
          },
          {
            icon: FiRefreshCw,
            title: 'Quick Action',
            description: 'Manage stock levels',
            color: 'from-[#ffa509] to-[#ff8c00]',
            bgColor: 'bg-yellow-50',
            textColor: 'text-[#ffa509]',
            textDark: 'text-yellow-900',
          },
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="relative z-10">
              <div className={`inline-flex p-3 bg-gradient-to-br ${card.color} rounded-lg mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-lg font-bold ${card.textDark} mb-1`}>{card.title}</h3>
              <p className={`text-sm ${card.textColor} font-medium`}>{card.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <ProductTable 
            initialFilters={{ stockStatus: 'out-of-stock' }}
            preserveFiltersOnReset={true}
            hiddenFilters={['minStock', 'maxStock', 'stockStatus']}
          />
        </div>
      </motion.div>
    </div>
  );
}

