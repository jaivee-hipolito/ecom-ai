'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUsers,
  FiMail,
  FiShield,
  FiUser,
  FiCalendar,
  FiEdit,
  FiPlus,
  FiEye,
  FiChevronRight,
  FiTrash2,
  FiX,
  FiAlertTriangle,
} from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Pagination from '@/components/ui/Pagination';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { User } from '@/types/user';
import Badge from '@/components/ui/Badge';

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}

interface UserTableProps {
  onUserChange?: () => void;
}

export default function UserTable({ onUserChange }: UserTableProps = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{ user: User | null; show: boolean }>({
    user: null,
    show: false,
  });
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.role) {
        params.append('role', filters.role);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const data: UserListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
    });
    setPage(1);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ user, show: true });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.user?._id) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${deleteConfirm.user._id}`, {
        method: 'DELETE',
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      // Close confirmation dialog
      setDeleteConfirm({ user: null, show: false });

      // Refresh users list
      await fetchUsers();

      // Call onUserChange callback if provided
      if (onUserChange) {
        onUserChange();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ user: null, show: false });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-[#000000] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-3 sm:mt-4 text-[#000000] font-semibold text-base sm:text-lg">Loading users...</p>
        </motion.div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    return role === 'admin'
      ? 'from-purple-500 to-pink-600'
      : 'from-blue-500 to-cyan-600';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? (
      <FiShield className="w-4 h-4" />
    ) : (
      <FiUser className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-lg">
                <FiFilter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#000000]">Filter Users</h2>
            </div>
            <Link href="/admin/users/add" className="w-full sm:w-auto cursor-pointer order-first sm:order-none">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ffa509] to-[#F9629F] hover:from-[#F9629F] hover:to-[#ffa509] border-0 text-white font-semibold shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline flex-shrink-0" />
                  Add User
                </Button>
              </motion.div>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <label className="block text-xs sm:text-sm font-semibold text-[#000000] mb-2 flex items-center gap-2">
                <FiSearch className="w-3 h-3 sm:w-4 sm:h-4 text-[#F9629F]" />
                Search
              </label>
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm sm:text-base"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <div className="flex items-center gap-2 mb-2">
                <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-[#F9629F]" />
                <label className="block text-xs sm:text-sm font-semibold text-[#000000]">
                  Role
                </label>
              </div>
              <Select
                label=""
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'customer', label: 'Customer' },
                ]}
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white text-sm sm:text-base"
              />
            </motion.div>
          </div>

          <div className="mt-3 sm:mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-[#000000] bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#F9629F] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                Reset Filters
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Users Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#000000]">
                Users <span className="text-[#F9629F]">({total})</span>
              </h2>
            </div>
          </div>

          {users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="inline-block p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-3 sm:mb-4">
                <FiUsers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#000000] mb-2">No Users Found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                {filters.search || filters.role
                  ? 'Try adjusting your filters'
                  : 'Users will appear here when they register'}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <AnimatePresence>
                  {users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-gray-200 hover:border-[#F9629F] transition-all overflow-hidden group"
                    >
                        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                          {/* User Avatar & Info */}
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {user.image ? (
                              <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="relative flex-shrink-0"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#F9629F]/20 to-purple-500/20 rounded-full blur-md"></div>
                                <img
                                  src={user.image}
                                  alt={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User'}
                                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full object-cover border-2 border-white shadow-lg relative z-10"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br ${getRoleColor(user.role || 'customer')} flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shadow-lg border-2 border-white flex-shrink-0`}
                              >
                                {user.firstName && user.lastName
                                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                                  : user.email?.charAt(0).toUpperCase()}
                              </motion.div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-[#000000] mb-1 group-hover:text-[#F9629F] transition-colors truncate">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.email || 'No Name'}
                              </h3>
                              <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-gradient-to-r ${getRoleColor(user.role || 'customer')} text-white text-xs font-semibold`}>
                                {getRoleIcon(user.role || 'customer')}
                                {user.role === 'admin' ? 'Admin' : 'Customer'}
                              </div>
                            </div>
                          </div>

                          {/* User Details */}
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex-shrink-0">
                                <FiMail className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 font-semibold">Email</p>
                                <p className="text-xs sm:text-sm font-bold text-[#000000] truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Created</p>
                                <div className="flex items-center gap-1 text-xs text-[#000000] font-semibold">
                                  <FiCalendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{formatDate(user.createdAt)}</span>
                                </div>
                              </div>
                              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Updated</p>
                                <div className="flex items-center gap-1 text-xs text-[#000000] font-semibold">
                                  <FiCalendar className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{formatDate(user.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200 space-y-2">
                            <Link href={`/admin/users/${user._id}`} className="cursor-pointer">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-between p-2 bg-gradient-to-r from-[#F9629F]/10 to-[#DB7093]/10 rounded-lg group-hover:from-[#F9629F]/20 group-hover:to-[#DB7093]/20 transition-all cursor-pointer"
                            >
                              <span className="text-xs sm:text-sm font-semibold text-[#000000] group-hover:text-[#F9629F] transition-colors">
                                View Details
                              </span>
                              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#F9629F] group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </motion.div>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => handleDeleteClick(user, e)}
                              className="w-full flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-lg border-2 border-red-200 hover:border-red-300 transition-all group cursor-pointer"
                            >
                              <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-red-600">Delete User</span>
                            </motion.button>
                          </div>
                        </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-200">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && deleteConfirm.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-red-200 max-w-md w-full mx-2 p-4 sm:p-5 md:p-6 relative overflow-hidden max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full">
                  <FiAlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
                </div>
              </div>

              {/* Warning Message */}
              <h3 className="text-xl sm:text-2xl font-bold text-[#000000] text-center mb-2">
                Delete User?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6 px-2">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[#000000]">
                  {deleteConfirm.user.firstName && deleteConfirm.user.lastName
                    ? `${deleteConfirm.user.firstName} ${deleteConfirm.user.lastName}`
                    : deleteConfirm.user.email}
                </span>
                ?
              </p>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <FiAlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning: This action cannot be undone!</p>
                    <p className="text-red-700">
                      All user data, including orders and addresses, will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-[#000000] font-semibold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
