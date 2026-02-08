'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GroupedProduct, findMatchingVariant } from '@/utils/productGrouping';
import ProductImage from './ProductImage';
import ColorSwatch from './ColorSwatch';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { IProduct } from '@/types/product';
import { FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';

interface GroupedProductCardProps {
  groupedProduct: GroupedProduct;
}

export default function GroupedProductCard({ groupedProduct }: GroupedProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { triggerAnimation } = useCartAnimation();
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});

  // Find the currently selected variant based on selected attributes
  const selectedVariant = useMemo(() => {
    if (Object.keys(selectedAttributes).length === 0) {
      // If no attributes selected, use first available variant
      return groupedProduct.variants.find((v) => v.stock > 0) || groupedProduct.variants[0];
    }
    return findMatchingVariant(groupedProduct.variants, selectedAttributes) || groupedProduct.variants[0];
  }, [selectedAttributes, groupedProduct.variants]);

  // Get display image from selected variant or first variant
  const displayImage = selectedVariant?.coverImage || selectedVariant?.images[0] || '';
  const displayPrice = selectedVariant?.price || groupedProduct.basePrice;
  const displayStock = selectedVariant?.stock || 0;
  const [availableStock, setAvailableStock] = useState<number>(displayStock);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [productData, setProductData] = useState<IProduct | null>(null);

  // Fetch product data to check for flash sale
  useEffect(() => {
    const fetchProductData = async () => {
      if (!selectedVariant?.productId) {
        setProductData(null);
        return;
      }
      
      try {
        const response = await fetch(`/api/products/${selectedVariant.productId}`);
        if (response.ok) {
          const data = await response.json();
          setProductData(data);
        }
      } catch (error) {
        console.error('Failed to fetch product data:', error);
        setProductData(null);
      }
    };

    fetchProductData();
  }, [selectedVariant?.productId]);

  // Calculate flash sale discount and prices from product data
  // New logic: Displayed price = basePrice, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: IProduct | null, basePrice: number) => {
    if (!product || !product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
        discountPercentage: 0,
        displayedPrice: basePrice,
        crossedOutPrice: basePrice,
        hasDiscount: false,
      };
    }

    const discount = product.flashSaleDiscount;
    const discountType = product.flashSaleDiscountType || 'percentage';
    
    let displayedPrice: number;
    let crossedOutPrice: number;
    let discountPercentage: number;

    // Displayed price is always the basePrice
    displayedPrice = basePrice;

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

  const flashSaleData = calculateFlashSaleData(productData, displayPrice);
  const hasFlashSaleDiscount = flashSaleData.hasDiscount;

  // Fetch product availability considering paid orders
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedVariant?.productId) {
        setAvailableStock(displayStock);
        setIsLoadingAvailability(false);
        return;
      }
      
      try {
        setIsLoadingAvailability(true);
        const response = await fetch(`/api/products/${selectedVariant.productId}/availability`);
        if (response.ok) {
          const data = await response.json();
          setAvailableStock(data.availableStock || 0);
        }
      } catch (error) {
        console.error('Failed to fetch product availability:', error);
        // Fallback to displayStock if API fails
        setAvailableStock(displayStock);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedVariant?.productId, displayStock]);

  // Check if product is already in cart and if adding would exceed stock
  const cartItem = selectedVariant
    ? cart?.items?.find(
        (item: any) =>
          (typeof item.product === 'string' ? item.product : item.product?._id) ===
          selectedVariant.productId
      )
    : null;
  const currentCartQuantity = cartItem?.quantity || 0;
  const canAddMore = availableStock > currentCartQuantity;
  const isOutOfStock = availableStock === 0;
  const stockLimitReached = !isOutOfStock && !canAddMore;

  // Create a mock product object for ProductImage component
  const mockProduct: IProduct = {
    _id: selectedVariant?.productId,
    name: groupedProduct.name,
    description: '',
    price: displayPrice,
    category: '',
    stock: displayStock,
    coverImage: displayImage,
    images: selectedVariant?.images || [],
  };

  // Check if selected variant (or first variant) is in wishlist
  const selectedVariantInWishlist = selectedVariant 
    ? isInWishlist(selectedVariant.productId)
    : groupedProduct.variants.some((v) => isInWishlist(v.productId));

  const handleAttributeSelect = (attributeKey: string, value: any) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeKey]: value,
    }));
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!selectedVariant) {
      alert('Please select a variant');
      return;
    }

    if (availableStock === 0) {
      alert('This variant is out of stock');
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
    const productImage = displayImage || undefined;

    // Trigger animation
    triggerAnimation(startPosition, productImage);

    try {
      setIsAddingToCart(true);
      await addToCart(selectedVariant.productId, 1);
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

    // Use selected variant for wishlist, or first variant if none selected
    const variantToUse = selectedVariant || groupedProduct.variants[0];
    
    if (!variantToUse || !variantToUse.productId) {
      alert('Please select a variant');
      return;
    }

    const isSelectedVariantInWishlist = isInWishlist(variantToUse.productId);

    try {
      setIsTogglingWishlist(true);
      if (isSelectedVariantInWishlist) {
        await removeFromWishlist(variantToUse.productId);
      } else {
        await addToWishlist(variantToUse.productId);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Get link to selected variant's detail page (or first variant if none selected)
  const productLink = useMemo(() => {
    const baseLink = `/products/${selectedVariant?.productId || groupedProduct.variants[0].productId}`;
    return hasFlashSaleDiscount ? `${baseLink}?flashSale=true` : baseLink;
  }, [selectedVariant?.productId, groupedProduct.variants, hasFlashSaleDiscount]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Allow attribute selection buttons to work without navigating
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <Link 
        href={productLink} 
        key={productLink}
        className="block" 
        onClick={handleCardClick}
      >
        <div className="relative aspect-square">
          <ProductImage product={mockProduct} className="w-full h-full" />
          {displayStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}
          
          {/* Flash Sale Badge */}
          {hasFlashSaleDiscount && (
            <div className="absolute top-2 left-2 z-30">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FiZap className="w-3 h-3" />
                </motion.div>
                <span className="text-[9px] font-black tracking-wide">FLASH</span>
              </motion.div>
            </div>
          )}

          {/* Discount Badge */}
          {hasFlashSaleDiscount && (
            <div className="absolute top-2 right-2 z-30">
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="bg-gradient-to-br from-[#ffa509] via-orange-500 to-[#ff8c00] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl border-2 border-white"
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
            aria-label={selectedVariantInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={selectedVariantInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`w-5 h-5 ${
                selectedVariantInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
              fill={selectedVariantInWishlist ? 'currentColor' : 'none'}
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
      </Link>
      <div className="p-4">
        <Link href={productLink} key={`title-${productLink}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {groupedProduct.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {groupedProduct.description}
          </p>
        </Link>

        {/* Attribute Selection */}
        {Object.keys(groupedProduct.allAttributes).length > 0 && (
          <div className="mb-3 pb-3 border-b border-gray-200 space-y-2">
            {Object.entries(groupedProduct.allAttributes).map(([key, values]) => {
              const attributeValues = Array.from(values);
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

              const isColor = key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');

              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-medium text-gray-600">{label}:</div>
                  <div className="flex flex-wrap gap-2">
                    {attributeValues.map((value) => {
                      const isSelected = selectedAttributes[key] === value;
                      const variantWithValue = groupedProduct.variants.find((v) => {
                        const attrValue = v.attributes[key];
                        if (Array.isArray(attrValue)) return attrValue.includes(value);
                        if (typeof attrValue === 'string' && attrValue.includes(',')) {
                          return attrValue.split(',').map((v) => v.trim()).includes(String(value).trim());
                        }
                        return attrValue === value;
                      });
                      const isAvailable = (variantWithValue?.stock ?? 0) > 0;

                      if (isColor && typeof value === 'string') {
                        return (
                          <ColorSwatch
                            key={String(value)}
                            color={String(value)}
                            size="sm"
                            selected={isSelected}
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) {
                                handleAttributeSelect(key, value);
                              }
                            }}
                          />
                        );
                      }

                      return (
                        <button
                          key={String(value)}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAttributeSelect(key, value);
                          }}
                          disabled={!isAvailable}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                          } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={!isAvailable ? 'Out of stock' : String(value)}
                        >
                          {String(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end mb-3">
          <div className="text-right">
            {hasFlashSaleDiscount ? (
              <>
                <span className="text-lg font-bold bg-gradient-to-r from-[#ffa509] to-orange-500 bg-clip-text text-transparent">
                  {formatCurrency(flashSaleData.displayedPrice)}
                </span>
                <div className="text-xs text-gray-500 line-through">
                  {formatCurrency(flashSaleData.crossedOutPrice)}
                </div>
              </>
            ) : (
              <>
                {groupedProduct.variants.length > 1 && displayPrice !== groupedProduct.basePrice && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatCurrency(groupedProduct.basePrice)}
                  </div>
                )}
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(displayPrice)}
                </span>
              </>
            )}
          </div>
        </div>

        {groupedProduct.variants.length > 1 && (
          <div className="text-xs text-gray-500 mb-2">
            {groupedProduct.variants.length} variants available
          </div>
        )}

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
  );
}

