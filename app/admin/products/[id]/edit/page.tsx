'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEdit, FiArrowLeft, FiPackage, FiSave } from 'react-icons/fi';
import ProductForm from '@/components/admin/ProductForm';
import Alert from '@/components/ui/Alert';
import { Product } from '@/types/product';

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
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,9,0.15),transparent_50%)]"></div>
          <div className="relative z-10 flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#ff8c00] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-white/80 text-lg font-medium">Loading product...</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#050b2c] via-[#0a1a4a] to-[#050b2c] p-8"
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
                  className="p-4 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-2xl shadow-2xl shadow-[#ffa509]/50"
                >
                  <FiEdit className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Edit Product
                  </h1>
                  <p className="text-white/80 text-lg flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-[#ffa509]" />
                    Update product information
                  </p>
                </div>
              </div>
              
              {/* Product Info Badge */}
              {product && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className="w-2 h-2 bg-[#ffa509] rounded-full animate-pulse"></div>
                  <span className="text-white/90 font-medium">
                    {product.name}
                  </span>
                  {product.featured && (
                    <span className="px-2 py-1 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white text-xs font-bold rounded-lg">
                      Featured
                    </span>
                  )}
                </motion.div>
              )}
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
        className="bg-white rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6 lg:p-10 relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffa509]/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#ff8c00]/5 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <ProductForm product={product} onSuccess={handleSuccess} />
        </div>
      </motion.div>

      {/* Quick Info Cards */}
      {product && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  ${parseFloat(product.price as any).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
                <span className="text-[#050b2c] font-bold text-lg">$</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Stock Level</p>
                <p className={`text-2xl font-bold ${
                  (product.stock as number) > 10 
                    ? 'text-green-600' 
                    : (product.stock as number) > 0 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`}>
                  {product.stock}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-[#050b2c]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-[#ffa509]/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Images</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {product.images?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-xl flex items-center justify-center">
                <FiSave className="w-6 h-6 text-[#050b2c]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
