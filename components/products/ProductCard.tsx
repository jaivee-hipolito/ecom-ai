'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/types/product';
import ProductImage from './ProductImage';
import ProductRating from './ProductRating';
import ColorSwatch from './ColorSwatch';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useState, useRef, useEffect } from 'react';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { triggerAnimation } = useCartAnimation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [availableStock, setAvailableStock] = useState<number>(product.stock || 0);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch product availability considering paid orders
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!product._id) return;
      
      try {
        setIsLoadingAvailability(true);
        const response = await fetch(`/api/products/${product._id}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailableStock(data.availableStock || 0);
        }
      } catch (error) {
        console.error('Failed to fetch product availability:', error);
        // Fallback to product.stock if API fails
        setAvailableStock(product.stock || 0);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [product._id, product.stock]);

  // Check if product is already in cart and if adding would exceed stock
  const cartItem = cart?.items?.find(
    (item: any) =>
      (typeof item.product === 'string' ? item.product : item.product?._id) === product._id
  );
  const currentCartQuantity = cartItem?.quantity || 0;
  const canAddMore = availableStock > currentCartQuantity;
  const isOutOfStock = availableStock === 0;
  const stockLimitReached = !isOutOfStock && !canAddMore;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Get button position for animation
    const buttonRect = addToCartButtonRef.current?.getBoundingClientRect();
    const startPosition = buttonRect
      ? {
          x: buttonRect.left + buttonRect.width / 2,
          y: buttonRect.top + buttonRect.height / 2,
        }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Get product image URL
    const productImage =
      product.images && product.images.length > 0
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : product.images[0].url
        : undefined;

    // Trigger animation
    triggerAnimation(startPosition, productImage);

    try {
      setIsAddingToCart(true);
      await addToCart(product._id!, 1);
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsTogglingWishlist(true);
      if (isInWishlist(product._id!)) {
        await removeFromWishlist(product._id!);
      } else {
        await addToWishlist(product._id!);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const inWishlist = isInWishlist(product._id!);

  if (!product._id) {
    console.error('Product missing _id:', product);
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square">
          <ProductImage product={product} className="w-full h-full" />
          {availableStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}
          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 cursor-pointer disabled:cursor-not-allowed"
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`w-5 h-5 ${
                inWishlist ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
              fill={inWishlist ? 'currentColor' : 'none'}
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
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
          
          {/* Product Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.attributes)
                  .slice(0, 3) // Show only first 3 attributes to keep card compact
                  .map(([key, value]) => {
                    // Skip null, undefined, or empty values
                    if (value === null || value === undefined || value === '') {
                      return null;
                    }

                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    // Handle color attributes with swatches
                    if (
                      (key.toLowerCase().includes('color') ||
                        key.toLowerCase().includes('colour')) &&
                      typeof value === 'string'
                    ) {
                      // Single color
                      if (!value.includes(',')) {
                        return (
                          <div key={key} className="flex items-center gap-1.5">
                            <ColorSwatch color={value} size="sm" />
                            <span className="text-xs text-gray-600 capitalize">
                              {value}
                            </span>
                          </div>
                        );
                      }
                      // Multiple colors - show first color only
                      const firstColor = value.split(',')[0].trim();
                      return (
                        <div key={key} className="flex items-center gap-1.5">
                          <ColorSwatch color={firstColor} size="sm" />
                          <span className="text-xs text-gray-600">
                            {firstColor}
                          </span>
                        </div>
                      );
                    }

                    // Handle boolean attributes
                    if (typeof value === 'boolean') {
                      return (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-600">
                            {label}:
                          </span>
                          <span className="text-xs text-gray-700">
                            {value ? (
                              <span className="text-green-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </span>
                        </div>
                      );
                    }

                    // Handle array values - show first item
                    if (Array.isArray(value) && value.length > 0) {
                      return (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-600">
                            {label}:
                          </span>
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {String(value[0])}
                            {value.length > 1 && ` +${value.length - 1}`}
                          </span>
                        </div>
                      );
                    }

                    // Default: display as string (truncate if too long)
                    const stringValue = String(value);
                    return (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-600">
                          {label}:
                        </span>
                        <span className="text-xs text-gray-700 truncate max-w-[100px]">
                          {stringValue.length > 15
                            ? `${stringValue.substring(0, 15)}...`
                            : stringValue}
                        </span>
                      </div>
                    );
                  })}
              </div>
              {Object.keys(product.attributes).length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{Object.keys(product.attributes).length - 3} more attributes
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <ProductRating
              rating={product.rating || 0}
              numReviews={product.numReviews}
            />
            <span className="text-lg font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <Button
            ref={addToCartButtonRef}
            onClick={handleAddToCart}
            disabled={isOutOfStock || stockLimitReached || isAddingToCart || cartLoading}
            className="w-full"
            size="sm"
          >
            {isAddingToCart
              ? 'Adding...'
              : isOutOfStock
              ? 'Out of Stock'
              : stockLimitReached
              ? 'Stock Limit Reached'
              : 'Add to Cart'}
          </Button>
        </div>
      </Link>
    </div>
  );
}
