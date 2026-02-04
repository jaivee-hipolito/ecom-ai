'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ICart, ICartItem } from '@/types/cart';
import { IProduct } from '@/types/product';

interface CartContextType {
  cart: ICart | null;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartSummary: () => {
    totalItems: number;
    totalPrice: number;
    items: ICartItem[];
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<ICart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else if (response.status === 401) {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to cart');
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add to cart');
        }

        const data = await response.json();
        setCart(data);
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const updateCartItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!isAuthenticated) {
        throw new Error('Please login to update cart');
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update cart');
        }

        const data = await response.json();
        setCart(data);
      } catch (error: any) {
        console.error('Error updating cart:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        throw new Error('Please login to remove from cart');
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/cart/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to remove from cart');
        }

        const data = await response.json();
        setCart(data);
      } catch (error: any) {
        console.error('Error removing from cart:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsLoading(true);
      // Remove all items one by one or implement a clear endpoint
      if (cart?.items) {
        for (const item of cart.items) {
          const productId =
            typeof item.product === 'string' ? item.product : item.product._id!;
          await fetch(`/api/cart/${productId}`, {
            method: 'DELETE',
          });
        }
      }
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, cart, fetchCart]);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const getCartSummary = useCallback(() => {
    if (!cart || !cart.items) {
      return { totalItems: 0, totalPrice: 0, items: [] };
    }

    let totalItems = 0;
    let totalPrice = 0;

    const items = cart.items.map((item) => {
      const product =
        typeof item.product === 'object' ? item.product : ({} as IProduct);
      const price = product.price || 0;
      const quantity = item.quantity || 0;

      totalItems += quantity;
      totalPrice += price * quantity;

      return item;
    });

    return { totalItems, totalPrice, items };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
        getCartSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
