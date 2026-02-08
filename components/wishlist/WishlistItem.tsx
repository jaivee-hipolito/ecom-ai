'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IProduct } from '@/types/product';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import Button from '@/components/ui/Button';
import ColorSwatch from '@/components/products/ColorSwatch';
import { formatCurrency } from '@/utils/currency';

interface WishlistItemProps {
  product: IProduct;
}

export default function WishlistItem({ product }: WishlistItemProps) {
  const { isAuthenticated } = useAuth();
  const { removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addToCart, isLoading: cartLoading, cart } = useCart();
  const { triggerAnimation } = useCartAnimation();
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [availableStock, setAvailableStock] = useState<number>(product.stock || 0);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  // Fetch product availability considering paid orders
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!product._id) {
        setAvailableStock(product.stock || 0);
        setIsLoadingAvailability(false);
        return;
      }
      
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

  const handleRemoveFromWishlist = async () => {
    if (!product._id) return;

    try {
      setIsRemoving(true);
      await removeFromWishlist(product._id);
    } catch (error: any) {
      alert(error.message || 'Failed to remove from wishlist');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!product._id) return;

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
      product.coverImage ||
      (product.images && product.images.length > 0
        ? typeof product.images[0] === 'string'
          ? product.images[0]
          : (product.images[0] as any)?.url || product.images[0]
        : undefined);

    // Trigger animation
    triggerAnimation(startPosition, productImage);

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, 1);
      alert('Product added to cart!');
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const displayImage =
    product.coverImage || product.images?.[0] || '/placeholder-image.png';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Product Image */}
        <Link
          href={`/products/${product._id}`}
          className="block sm:w-48 flex-shrink-0"
        >
          <div className="relative aspect-square w-full sm:w-48">
            {displayImage && !displayImage.includes('placeholder') ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            {availableStock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col">
          <div className="flex-1">
            <Link href={`/products/${product._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(product.attributes).map(([key, value]) => {
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
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                            {label}:
                          </span>
                          <div className="flex items-center gap-2">
                            <ColorSwatch color={value} size="sm" />
                            <span className="text-sm text-gray-900 capitalize">
                              {value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    // Multiple colors - show first color only
                    const firstColor = value.split(',')[0].trim();
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                          {label}:
                        </span>
                        <div className="flex items-center gap-2">
                          <ColorSwatch color={firstColor} size="sm" />
                          <span className="text-sm text-gray-900">
                            {firstColor}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Handle boolean attributes
                  if (typeof value === 'boolean') {
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                          {label}:
                        </span>
                        <span className="text-sm text-gray-900">
                          {value ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </span>
                      </div>
                    );
                  }

                  // Handle array values
                  if (Array.isArray(value) && value.length > 0) {
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                          {label}:
                        </span>
                        <span className="text-sm text-gray-900">
                          {value.join(', ')}
                        </span>
                      </div>
                    );
                  }

                  // Default: display as string
                  const stringValue = String(value);
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 min-w-[80px]">
                        {label}:
                      </span>
                      <span className="text-sm text-gray-900">
                        {stringValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end mb-3">
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="flex items-center justify-end text-sm text-gray-600 mb-4">
              <span
                className={`font-semibold ${
                  availableStock > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {availableStock > 0
                  ? `${availableStock} in stock`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            <Button
              ref={addToCartButtonRef}
              onClick={handleAddToCart}
              disabled={isOutOfStock || stockLimitReached || isAddingToCart || cartLoading}
              className="flex-1"
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
            <Button
              onClick={handleRemoveFromWishlist}
              disabled={isRemoving || wishlistLoading}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial sm:w-auto"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

