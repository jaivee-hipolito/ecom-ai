'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/types/product';
import ProductImage from './ProductImage';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';

interface ProductCardProps {
  product: IProduct;
  showAttributes?: boolean | 'color-only';
}

export default function ProductCard({ product, showAttributes = true }: ProductCardProps) {
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
          : (product.images[0] as any)?.url || product.images[0]
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

  // Calculate flash sale discount and prices from product data
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: IProduct) => {
    if (!product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
        discountPercentage: 0,
        displayedPrice: product.price,
        crossedOutPrice: product.price,
        hasDiscount: false,
      };
    }

    const discount = product.flashSaleDiscount;
    const discountType = product.flashSaleDiscountType || 'percentage';
    
    let displayedPrice: number;
    let crossedOutPrice: number;
    let discountPercentage: number;

    // Displayed price is always the product.price
    displayedPrice = product.price;

    if (discountType === 'percentage') {
      // Crossed out price = price * (percentage/100) + price
      crossedOutPrice = displayedPrice * (discount / 100) + displayedPrice;
      discountPercentage = discount;
    } else {
      // Fixed amount: crossed out price = price + discount
      crossedOutPrice = displayedPrice + discount;
      discountPercentage = (discount / displayedPrice) * 100;
    }

    return {
      discountPercentage: Math.round(discountPercentage),
      displayedPrice,
      crossedOutPrice,
      hasDiscount: true,
    };
  };

  const flashSaleData = calculateFlashSaleData(product);
  const hasFlashSaleDiscount = flashSaleData.hasDiscount;

  if (!product._id) {
    console.error('Product missing _id:', product);
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden relative">
      <Link href={`/products/${product._id}${hasFlashSaleDiscount ? '?flashSale=true' : ''}`} className="flex flex-col flex-1 min-h-0">
        <div className="relative aspect-square flex-shrink-0">
          <ProductImage product={product} className="w-full h-full" />
          {availableStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Discount Badge */}
          {hasFlashSaleDiscount && (
            <div className="absolute top-2 right-2 z-30">
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center shadow-xl"
              >
                <div className="text-center">
                  <div className="text-[10px] font-black leading-tight">-{flashSaleData.discountPercentage}%</div>
                  <div className="text-[6px] font-bold">OFF</div>
                </div>
              </motion.div>
            </div>
          )}

          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className={`absolute ${hasFlashSaleDiscount ? 'top-14' : 'top-2'} right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 cursor-pointer disabled:cursor-not-allowed`}
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
        <div className="p-4 flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          
            {/* Product Attributes - Minimal text style (Label: Value inline) */}
            {showAttributes && product.attributes && (() => {
            const entries = Object.entries(product.attributes).filter(([key]) => {
              if (showAttributes === 'color-only') {
                const k = key.toLowerCase();
                return k.includes('color') || k.includes('colour');
              }
              return true;
            });
            if (entries.length === 0) return null;
            return (
            <div className="mb-3 pb-3 border-b border-gray-100 space-y-1">
              {entries.slice(0, 3).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') {
                    return null;
                  }

                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();

                  let displayValue: string;
                  if (typeof value === 'boolean') {
                    displayValue = value ? 'Yes' : 'No';
                  } else if (Array.isArray(value) && value.length > 0) {
                    displayValue = value.map(String).join(', ');
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <p
                      key={key}
                      className="text-sm text-[#4D4D4D] leading-relaxed m-0"
                    >
                      {label}: {displayValue}
                    </p>
                  );
                })}
              {entries.length > 3 && (
                <p className="text-sm text-[#4D4D4D] pt-0.5">
                  +{entries.length - 3} more
                </p>
              )}
            </div>
            );
          })()}
          </div>
          
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-end mb-3 gap-2">
            {hasFlashSaleDiscount ? (
              <>
                <span className="text-lg font-bold bg-gradient-to-r from-[#F9629F] to-[#DB7093] bg-clip-text text-transparent">
                  {formatCurrency(flashSaleData.displayedPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(flashSaleData.crossedOutPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-[#F9629F]">
                {formatCurrency(product.price)}
              </span>
            )}
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
        </div>
      </Link>
    </div>
  );
}
