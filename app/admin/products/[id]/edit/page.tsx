'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEdit, FiArrowLeft, FiPackage, FiSave } from 'react-icons/fi';
import ProductForm from '@/components/admin/ProductForm';
import Alert from '@/components/ui/Alert';
import { Product } from '@/types/product';
import { formatCurrency } from '@/utils/currency';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/admin/products');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] p-4 sm:p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
          <div className="relative z-10 flex items-center justify-center min-h-[140px] sm:min-h-[180px] md:min-h-[200px]">
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-[#FC9BC2] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-transparent border-r-[#C41675] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium">Loading product...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] p-4 sm:p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
          <div className="relative z-10">
            <Alert variant="error">
              {error || 'Product not found'}
            </Alert>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section — compact on mobile/iPad */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] p-4 sm:p-5 md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-[#FC9BC2] to-[#C41675] rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-[#FC9BC2]/50 flex-shrink-0"
                >
                  <FiEdit className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-0.5 sm:mb-1 md:mb-2 truncate">
                    Edit Product
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-lg flex items-center gap-1.5 sm:gap-2">
                    <FiPackage className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#FC9BC2] flex-shrink-0" />
                    <span className="truncate">Update product information</span>
                  </p>
                </div>
              </div>
              {/* Product Info Badge — compact, wraps on small */}
              {product && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 max-w-full"
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FC9BC2] rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-white/90 font-medium text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">
                    {product.name}
                  </span>
                  {product.featured && (
                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-[#FC9BC2] to-[#C41675] text-white text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg flex-shrink-0">
                      Featured
                    </span>
                  )}
                </motion.div>
              )}
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

      {/* Form Card — less padding on small screens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg border-2 border-[#FC9BC2]/20 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#FC9BC2]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-tr from-[#C41675]/5 to-transparent rounded-full blur-xl"></div>
        <div className="relative z-10">
          <ProductForm product={product} onSuccess={handleSuccess} />
        </div>
      </motion.div>

      {/* Quick Info Cards — compact grid on mobile */}
      {product && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#FC9BC2]/20 p-2.5 sm:p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0 truncate">Price</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-[#1a1a1a] truncate tabular-nums">
                  {formatCurrency(parseFloat(product.price as any))}
                </p>
              </div>
              <div className="hidden sm:flex w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#FC9BC2] to-[#F472B6] rounded-lg md:rounded-xl items-center justify-center flex-shrink-0">
                <span className="text-[#1a1a1a] font-bold text-sm md:text-lg">$</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#FC9BC2]/20 p-2.5 sm:p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0 truncate">Stock</p>
                <p className={`text-sm sm:text-lg md:text-2xl font-bold truncate tabular-nums ${
                  (product.stock as number) > 10
                    ? 'text-green-600'
                    : (product.stock as number) > 0
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {product.stock}
                </p>
              </div>
              <div className="hidden sm:flex w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#FC9BC2] to-[#F472B6] rounded-lg md:rounded-xl items-center justify-center flex-shrink-0">
                <FiPackage className="w-4 h-4 md:w-6 md:h-6 text-[#1a1a1a]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border-2 border-[#FC9BC2]/20 p-2.5 sm:p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-0 truncate">Images</p>
                <p className="text-sm sm:text-lg md:text-2xl font-bold text-[#1a1a1a] truncate tabular-nums">
                  {product.images?.length || 0}
                </p>
              </div>
              <div className="hidden sm:flex w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#FC9BC2] to-[#F472B6] rounded-lg md:rounded-xl items-center justify-center flex-shrink-0">
                <FiSave className="w-4 h-4 md:w-6 md:h-6 text-[#1a1a1a]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
