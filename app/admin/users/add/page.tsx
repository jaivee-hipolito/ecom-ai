'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUserPlus, FiArrowLeft, FiInfo, FiShield, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import UserForm from '@/components/admin/UserForm';

export default function AddUserPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/users');
    router.refresh();
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#1a1a2e] to-[#050b2c] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.12),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
              >
                <Link
                  href="/admin/users"
                  className="p-2 sm:p-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 hover:bg-white/20 transition-all inline-flex"
                >
                  <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </Link>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-2 sm:p-3 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0"
                  >
                    <FiUserPlus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>
                  <span>Add New User</span>
                </h1>
                <p className="text-white/80 text-sm sm:text-base md:text-lg">
                  Create a new customer or admin user account
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 flex-shrink-0"
            >
              <div className="flex items-center gap-2 text-white">
                <FiInfo className="w-5 h-5 text-[#F9629F]" />
                <div>
                  <p className="text-xs text-white/70">Quick Tip</p>
                  <p className="text-sm font-semibold">Choose role carefully</p>
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-4 sm:p-5 md:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <UserForm onSuccess={handleSuccess} />
        </div>
      </motion.div>
    </div>
  );
}

