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
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/admin/users"
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <FiArrowLeft className="w-6 h-6 text-white" />
                </Link>
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl shadow-lg"
                  >
                    <FiUserPlus className="w-8 h-8 text-white" />
                  </motion.div>
                  Add New User
                </h1>
                <p className="text-white/80 text-lg">
                  Create a new customer or admin user account
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center gap-2 text-white">
                <FiInfo className="w-5 h-5 text-[#ffa509]" />
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
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-[#ffa509]/20 p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <UserForm onSuccess={handleSuccess} />
        </div>
      </motion.div>
    </div>
  );
}

