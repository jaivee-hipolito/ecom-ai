'use client';

import WishlistItem from '@/components/wishlist/WishlistItem';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { IProduct } from '@/types/product';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wishlist, isLoading } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading wishlist..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Extract products from wishlist
  const products =
    wishlist?.products?.filter(
      (p): p is IProduct => typeof p === 'object' && p !== null
    ) || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Wishlist
            </h1>
            <p className="mt-2 text-gray-600">
              {products.length === 0
                ? 'No items in your wishlist'
                : `${products.length} ${products.length === 1 ? 'item' : 'items'} saved`}
            </p>
          </div>
          {products.length > 0 && (
            <Link href="/dashboard/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Start adding products to your wishlist to save them for later
          </p>
          <Link href="/dashboard/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        /* Wishlist Items */
        <div className="space-y-4">
          {products.map((product) => (
            <WishlistItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

