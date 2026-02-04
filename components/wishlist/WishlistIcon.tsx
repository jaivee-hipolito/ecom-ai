'use client';

import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';

export default function WishlistIcon() {
  const { isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/dashboard/wishlist"
      className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
      aria-label="Wishlist"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {wishlistCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {wishlistCount > 99 ? '99+' : wishlistCount}
        </span>
      )}
    </Link>
  );
}

