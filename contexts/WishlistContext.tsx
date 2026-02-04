'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { IWishlist } from '@/types/wishlist';
import { IProduct } from '@/types/product';

interface WishlistContextType {
  wishlist: IWishlist | null;
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<IWishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch wishlist from API
   */
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      } else if (response.status === 401) {
        setWishlist(null);
      } else {
        console.error('Failed to fetch wishlist:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch wishlist when authentication status changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Add product to wishlist
   */
  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to wishlist');
      }

      if (!productId) {
        throw new Error('Product ID is required');
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add to wishlist');
        }

        const data = await response.json();
        setWishlist(data);
      } catch (error: any) {
        console.error('Error adding to wishlist:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        throw new Error('Please login to remove from wishlist');
      }

      if (!productId) {
        throw new Error('Product ID is required');
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to remove from wishlist');
        }

        const data = await response.json();
        setWishlist(data);
      } catch (error: any) {
        console.error('Error removing from wishlist:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      if (!wishlist || !wishlist.products || !productId) {
        return false;
      }

      return wishlist.products.some((p) => {
        if (typeof p === 'string') {
          return p === productId;
        }
        const product = p as IProduct;
        return product._id === productId;
      });
    },
    [wishlist]
  );

  /**
   * Refresh wishlist data
   */
  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Calculate wishlist item count
   */
  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
