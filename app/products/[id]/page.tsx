'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import ProductDetail from '@/components/products/ProductDetail';
import Loading from '@/components/ui/Loading';
import { useProduct } from '@/hooks/useProducts';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { product, isLoading, error } = useProduct(productId || null);

  // Debug logging
  useEffect(() => {
    if (productId) {
      console.log('ProductDetailPage - Product ID:', productId);
    } else {
      console.warn('ProductDetailPage - No product ID found in params');
    }
  }, [productId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading product..." />
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/dashboard/products"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Products
              </Link>
            </div>
          </div>
        ) : product ? (
          <ProductDetail product={product} />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
