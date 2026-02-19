'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTag, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiLayers, 
  FiInfo,
  FiChevronRight,
  FiX,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Category } from '@/types/category';

interface CategoryTableProps {
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export default function CategoryTable({
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId,
      categoryName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.categoryId) return;

    setDeleting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/categories/${deleteModal.categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setSuccessMessage(`Category "${deleteModal.categoryName}" deleted successfully`);
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });

      if (onDelete) {
        onDelete(deleteModal.categoryId);
      } else {
        await fetchCategories();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-20"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#F9629F] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#DB7093] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animated Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="error" onClose={() => setError('')}>
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5" />
                {error}
              </div>
            </Alert>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert variant="success" onClose={() => setSuccessMessage('')}>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5" />
                {successMessage}
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9629F]/10 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-gradient-to-br from-[#F9629F] to-[#DB7093] rounded-xl shadow-lg"
            >
              <FiLayers className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-[#000000]">
                Categories
              </h3>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <span className="text-[#F9629F] font-bold text-lg">{categories.length}</span>
                <span className="text-sm">total categories</span>
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/admin/categories/create">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-[#DB7093] hover:to-[#F9629F]">
                <FiPlus className="w-5 h-5" />
                Add New Category
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Categories Grid/Cards */}
      {categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#F9629F]/20 p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F9629F]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-block p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F9629F]/10 to-[#DB7093]/10 rounded-full mb-3 sm:mb-4 md:mb-6"
            >
              <FiTag className="w-16 h-16 text-[#F9629F]" />
            </motion.div>
            <h3 className="text-2xl font-bold text-[#000000] mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first category</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/categories/create">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <FiPlus className="w-5 h-5" />
                  Create First Category
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <AnimatePresence>
            {categories.map((category, index) => {
              const attributes = category.attributes || [];
              const gradientColors = [
                'from-blue-500 to-cyan-600',
                'from-purple-500 to-pink-600',
                'from-green-500 to-emerald-600',
                'from-orange-500 to-red-600',
                'from-indigo-500 to-blue-600',
                'from-teal-500 to-cyan-600',
              ];
              const colorIndex = index % gradientColors.length;
              
              return (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#F9629F]/20 p-3 sm:p-4 md:p-6 relative overflow-hidden group cursor-pointer hover:border-[#F9629F]/40 transition-all duration-300"
                >
                  {/* Animated Background Gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColors[colorIndex]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    {/* Category Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`p-3 bg-gradient-to-br ${gradientColors[colorIndex]} rounded-xl shadow-lg flex-shrink-0`}
                        >
                          <FiTag className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-[#000000] mb-1 truncate">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-medium bg-[#000000]/10 text-[#000000] rounded-md">
                              {category.slug}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description || (
                          <span className="text-gray-400 italic">No description provided</span>
                        )}
                      </p>
                    </div>

                    {/* Attributes */}
                    <div className="mb-4">
                      {attributes.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                            <FiInfo className="w-4 h-4 text-[#F9629F]" />
                            {attributes.length} {attributes.length === 1 ? 'attribute' : 'attributes'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {attributes.slice(0, 3).map((attr, attrIndex) => (
                              <motion.span
                                key={attrIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 + attrIndex * 0.05 }}
                                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200"
                              >
                                {attr.label || attr.name}
                                {attr.required && (
                                  <span className="ml-1 text-red-500 font-bold">*</span>
                                )}
                              </motion.span>
                            ))}
                            {attributes.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                +{attributes.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FiInfo className="w-4 h-4" />
                          No attributes defined
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <Link href={`/admin/categories/${category._id}/edit`}>
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                          </button>
                        </Link>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1"
                      >
                        <button
                          onClick={() => handleDeleteClick(category._id!, category.name)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        itemName={deleteModal.categoryName}
        isLoading={deleting}
      />
    </div>
  );
}

