'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import ProductDetail from '@/components/products/ProductDetail';
import Loading from '@/components/ui/Loading';
import { useProduct } from '@/hooks/useProducts';
import Button from '@/components/ui/Button';

/**
 * Admin product view: same content as customer product page, kept inside admin layout (sidebar + header).
 * Linked from admin home when productLinkPrefix is /admin/products.
 */
export default function AdminProductViewPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { product, isLoading, error } = useProduct(productId || null);

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Action bar: sticky on small screens so Edit stays accessible while scrolling */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 mb-4 sm:mb-6 rounded-xl border border-gray-200/90 bg-white/95 backdrop-blur-sm shadow-sm sm:shadow"
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-2 sm:gap-3 p-3 sm:p-4">
          <Link
            href="/admin/home"
            className="inline-flex items-center justify-center sm:justify-start gap-2 min-h-[48px] sm:min-h-[44px] px-4 py-3 sm:py-2.5 text-sm font-medium text-gray-600 hover:text-[#F9629F] hover:bg-gray-50 rounded-xl transition-colors touch-manipulation order-2 sm:order-1 flex-1 sm:flex-initial"
          >
            <FiArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden />
            <span>Back to Admin Home</span>
          </Link>
          {product && (
            <Link
              href={`/admin/products/${productId}/edit`}
              className="inline-flex items-center justify-center gap-2.5 min-h-[48px] sm:min-h-[44px] px-5 py-3.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all touch-manipulation w-full sm:w-auto order-1 sm:order-2 sm:ml-auto border border-[#F9629F]/30"
            >
              <FiEdit className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden />
              <span>Edit product</span>
            </Link>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loading size="lg" text="Loading product..." />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/admin/home">
            <Button variant="outline">Back to Admin Home</Button>
          </Link>
        </div>
      ) : product ? (
        <ProductDetail product={product} />
      ) : null}
    </div>
  );
}
