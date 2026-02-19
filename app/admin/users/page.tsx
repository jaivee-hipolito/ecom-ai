'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiShield, FiUser } from 'react-icons/fi';
import UserTable from '@/components/admin/UserTable';

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  customerUsers: number;
}

export default function AdminUsersPage() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminUsers: 0,
    customerUsers: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      // Fetch all users without pagination to get counts
      const [totalResponse, adminResponse, customerResponse] = await Promise.all([
        fetch('/api/admin/users?limit=1'),
        fetch('/api/admin/users?role=admin&limit=1'),
        fetch('/api/admin/users?role=customer&limit=1'),
      ]);

      const [totalData, adminData, customerData] = await Promise.all([
        totalResponse.json(),
        adminResponse.json(),
        customerResponse.json(),
      ]);

      if (totalResponse.ok && adminResponse.ok && customerResponse.ok) {
        setStats({
          totalUsers: totalData.total || 0,
          adminUsers: adminData.total || 0,
          customerUsers: customerData.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
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
          <div className="flex flex-col gap-3 sm:gap-5 md:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-[#ffa509] to-[#F9629F] rounded-lg sm:rounded-xl shadow-lg w-fit"
                >
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </motion.div>
                <span className="truncate">User Management</span>
              </h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base line-clamp-2">
                View and manage all registered users and customers
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 [&>*:last-child]:sm:col-span-1 [&>*:last-child]:col-span-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffa509] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-white/70 truncate">Total Users</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold tabular-nums">
                      {loadingStats ? (
                        <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        stats.totalUsers.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffa509] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-white/70 truncate">Admins</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold tabular-nums">
                      {loadingStats ? (
                        <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        stats.adminUsers.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-white/20"
              >
                <div className="flex items-center gap-2 sm:gap-3 text-white">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffa509] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-white/70 truncate">Customers</p>
                    <p className="text-base sm:text-lg md:text-xl font-bold tabular-nums">
                      {loadingStats ? (
                        <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        stats.customerUsers.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <UserTable onUserChange={fetchUserStats} />
    </div>
  );
}

