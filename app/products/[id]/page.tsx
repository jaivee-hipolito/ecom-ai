'use client';

import { useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Footer from '@/components/shared/Footer';
import PageTopBanner from '@/components/shared/PageTopBanner';
import ProductDetail from '@/components/products/ProductDetail';
import Loading from '@/components/ui/Loading';
import { useProduct } from '@/hooks/useProducts';
import Link from 'next/link';

function ProductDetailContent() {
  const params = useParams();
  const productId = params?.id as string;
  const { product, isLoading, error } = useProduct(productId || null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    if (productId) {
      console.log('ProductDetailPage - Product ID:', productId);
    } else {
      console.warn('ProductDetailPage - No product ID found in params');
    }
  }, [productId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {isAuthenticated && <DashboardSidebar />}
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {isAuthenticated && <DashboardSidebar />}
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
        <Navbar />
        <PageTopBanner />

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
                  href="/products"
                  className="inline-block px-6 py-3 bg-[#FDE8F0] text-[#000000] border border-gray-300 rounded-lg hover:bg-[#FC9BC2] transition-colors font-medium"
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
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading product..." />
        </div>
        <Footer />
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
