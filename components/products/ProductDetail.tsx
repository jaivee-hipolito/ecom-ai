'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { IProduct, IProductVariant } from '@/types/product';
import ProductImage from './ProductImage';
import ProductAttributes from './ProductAttributes';
import ProductReviews from './ProductReviews';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useCartAnimation } from '@/contexts/CartAnimationContext';
import Image from 'next/image';
import ColorSwatch from './ColorSwatch';
import { findMatchingVariant } from '@/utils/productGrouping';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2, FiZap } from 'react-icons/fi';
import BNPLInstallments from './BNPLInstallments';
import { formatCurrency } from '@/utils/currency';
import ProductRating from './ProductRating';

interface ProductDetailProps {
  product: IProduct;
  isFlashSale?: boolean;
}

export default function ProductDetail({ product, isFlashSale: propFlashSale }: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: cartLoading, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { triggerAnimation } = useCartAnimation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [availableStock, setAvailableStock] = useState<number>(0); // Start with 0 until availability is fetched
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  // Check if product is from flash sale (from prop, URL parameter, or product data)
  const isFlashSale = propFlashSale !== undefined 
    ? propFlashSale 
    : (searchParams?.get('flashSale') === 'true' || product.isFlashSale === true);

  // Calculate flash sale discount and prices from product data
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  const calculateFlashSaleData = (product: IProduct) => {
    if (!product.isFlashSale || !product.flashSaleDiscount || product.flashSaleDiscount === 0) {
      return {
        discount: 0,
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
      discount,
      discountPercentage: Math.round(discountPercentage),
      displayedPrice,
      crossedOutPrice,
      hasDiscount: true,
    };
  };

  // Check if product has multiple variants (2 or more)
  const hasVariants = product.variants && product.variants.length >= 2;

  // Convert variants to ProductVariant format for findMatchingVariant
  const variantList: Array<{
    productId: string;
    attributes: Record<string, any>;
    stock: number;
    price: number;
    images: string[];
    coverImage?: string;
  }> = useMemo(() => {
    if (!hasVariants || !product.variants) return [];
    return product.variants.map((v) => ({
      productId: v._id,
      attributes: v.attributes || {},
      stock: v.stock || 0,
      price: v.price || 0,
      images: v.images || [],
      coverImage: v.coverImage,
    }));
  }, [hasVariants, product.variants]);

  // Find the currently selected variant based on selected attributes
  const selectedVariant = useMemo(() => {
    if (!hasVariants || variantList.length === 0) {
      return null;
    }
    if (Object.keys(selectedAttributes).length === 0) {
      // If no attributes selected, use current product as default
      return variantList.find((v) => v.productId === product._id) || variantList[0];
    }
    
    // First, try to find exact match
    let match = findMatchingVariant(variantList, selectedAttributes);
    
    // If no exact match, try to find partial match prioritizing color attributes
    if (!match && Object.keys(selectedAttributes).length > 0) {
      // Prioritize color attributes first
      const colorKeys = Object.keys(selectedAttributes).filter(key => 
        key.toLowerCase().includes('color') || key.toLowerCase().includes('colour')
      );
      
      // Use color attribute if available, otherwise use the first attribute
      const priorityKey = colorKeys.length > 0 ? colorKeys[0] : Object.keys(selectedAttributes)[0];
      const priorityValue = selectedAttributes[priorityKey];
      
      // Find variants that match the priority attribute (e.g., color)
      const partialMatches = variantList.filter((v) => {
        const attrValue = v.attributes[priorityKey];
        if (attrValue === null || attrValue === undefined) return false;
        
        // Normalize for comparison
        const normalizeValue = (val: any): string => {
          if (val === null || val === undefined) return '';
          return String(val).toLowerCase().trim();
        };
        
        const normalizedSelected = normalizeValue(priorityValue);
        
        if (Array.isArray(attrValue)) {
          return attrValue.some(v => normalizeValue(v) === normalizedSelected);
        }
        if (typeof attrValue === 'string' && attrValue.includes(',')) {
          const values = attrValue.split(',').map(v => normalizeValue(v));
          return values.includes(normalizedSelected);
        }
        return normalizeValue(attrValue) === normalizedSelected;
      });
      
      // If we found partial matches, use the first one
      if (partialMatches.length > 0) {
        match = partialMatches[0];
      }
    }
    
    // Fallback to current product or first variant
    return match || variantList.find((v) => v.productId === product._id) || variantList[0];
  }, [selectedAttributes, variantList, hasVariants, product._id]);

  // Get display values based on selected variant or current product
  const displayProduct = useMemo(() => {
    if (hasVariants && selectedVariant) {
      return {
        _id: selectedVariant.productId ? String(selectedVariant.productId) : (product._id ? String(product._id) : ''),
        stock: selectedVariant.stock,
        price: selectedVariant.price,
        images: selectedVariant.images.length > 0 ? selectedVariant.images : product.images || [],
        coverImage: selectedVariant.coverImage || selectedVariant.images[0] || product.coverImage,
      };
    }
    return {
      _id: product._id ? String(product._id) : '',
      stock: product.stock,
      price: product.price,
      images: product.images || [],
      coverImage: product.coverImage,
    };
  }, [hasVariants, selectedVariant, product]);

  const images = displayProduct.images || [];
  const displayImage =
    images[selectedImageIndex] || displayProduct.coverImage || images[0] || '';

  // Calculate flash sale prices (after displayProduct is initialized)
  // Use actual flash sale data from product
  const flashSaleData = calculateFlashSaleData(product);
  const hasFlashSaleDiscount = isFlashSale && flashSaleData.hasDiscount && product.isFlashSale;
  
  // Calculate prices - new logic: displayed price = displayProduct.price, crossed out = price * (percentage/100) + price
  let displayPrice: number;
  let crossedOutPrice: number;
  let flashSaleDiscount: number;
  
  if (hasFlashSaleDiscount && flashSaleData.hasDiscount) {
    const basePrice = displayProduct.price; // Displayed price (variant or main product)
    displayPrice = basePrice;
    
    // Calculate crossed out price based on discount type
    if (product.flashSaleDiscountType === 'percentage' && product.flashSaleDiscount) {
      // Crossed out price = price * (percentage/100) + price
      crossedOutPrice = basePrice * (product.flashSaleDiscount / 100) + basePrice;
      flashSaleDiscount = product.flashSaleDiscount;
    } else if (product.flashSaleDiscountType === 'fixed' && product.flashSaleDiscount) {
      // Fixed amount: crossed out price = price + discount
      crossedOutPrice = basePrice + product.flashSaleDiscount;
      flashSaleDiscount = Math.round((product.flashSaleDiscount / basePrice) * 100);
    } else {
      displayPrice = basePrice;
      crossedOutPrice = basePrice;
      flashSaleDiscount = 0;
    }
  } else {
    displayPrice = displayProduct.price;
    crossedOutPrice = displayProduct.price;
    flashSaleDiscount = 0;
  }

  // Collect all unique attribute values from variants
  const allAttributes = useMemo(() => {
    if (!hasVariants || !product.variants) return {};
    const attrs: Record<string, Set<string | number | boolean>> = {};
    product.variants.forEach((variant) => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!attrs[key]) {
            attrs[key] = new Set();
          }
          if (Array.isArray(value)) {
            value.forEach((v) => attrs[key].add(v));
          } else if (typeof value === 'string' && value.includes(',')) {
            value.split(',').forEach((v) => {
              const trimmed = v.trim();
              if (trimmed) attrs[key].add(trimmed);
            });
          } else if (value !== null && value !== undefined && value !== '') {
            attrs[key].add(value);
          }
        });
      }
    });
    return attrs;
  }, [hasVariants, product.variants]);

  // Check if image is a placeholder
  const isPlaceholderImage = (url: string) => {
    return (
      !url ||
      url.includes('example.com') ||
      url.startsWith('http://localhost') ||
      url === ''
    );
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const handleAttributeSelect = (attributeKey: string, value: any) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeKey]: value,
    }));
    // Reset image index when variant changes
    setSelectedImageIndex(0);
  };

  // Initialize selected attributes from URL parameters (e.g., from cart link)
  useEffect(() => {
    if (!hasVariants || !searchParams || variantList.length === 0) return;
    
    const urlAttributes: Record<string, any> = {};
    let hasUrlAttributes = false;
    
    // Read all URL parameters that match product attributes
    searchParams.forEach((value, key) => {
      // Check if this key exists in any variant's attributes
      const attributeExists = variantList.some(v => v.attributes && key in v.attributes);
      if (attributeExists) {
        urlAttributes[key] = value;
        hasUrlAttributes = true;
      }
    });
    
    // Set attributes from URL if they exist (this takes precedence over auto-select)
    if (hasUrlAttributes) {
      setSelectedAttributes(urlAttributes);
    }
  }, [hasVariants, searchParams, variantList.length]); // Only run once when component mounts or URL changes

  // Auto-select first available attribute value for each attribute if product has variants
  useEffect(() => {
    if (!hasVariants || Object.keys(allAttributes).length === 0 || variantList.length === 0) return;
    
    // Check if URL has attribute parameters - if so, skip auto-select
    const hasUrlAttributes = searchParams && Array.from(searchParams.keys()).some(key => 
      variantList.some(v => v.attributes && key in v.attributes)
    );
    
    // Only auto-select if no attributes are currently selected and no URL attributes
    if (Object.keys(selectedAttributes).length === 0 && !hasUrlAttributes) {
      const initialAttributes: Record<string, any> = {};
      
      Object.entries(allAttributes).forEach(([key, values]) => {
        // Find the first available value (variant with stock > 0)
        const attributeValues = Array.from(values);
        for (const value of attributeValues) {
          // Check if there's a variant with this attribute value that has stock
          const variantWithValue = variantList.find((v) => {
            const attrValue = v.attributes[key];
            if (Array.isArray(attrValue)) return attrValue.includes(value);
            if (typeof attrValue === 'string' && attrValue.includes(',')) {
              return attrValue.split(',').map((v) => v.trim()).includes(String(value).trim());
            }
            return attrValue === value;
          });
          
          // Select the first available variant (stock > 0) or first value if no stock check needed
          if (variantWithValue && (variantWithValue.stock > 0 || variantList.length === 1)) {
            initialAttributes[key] = value;
            break; // Use first available value for this attribute
          }
        }
        
        // If no available variant found, just use the first value
        if (!initialAttributes[key] && attributeValues.length > 0) {
          initialAttributes[key] = attributeValues[0];
        }
      });
      
      // Only set if we have at least one attribute to select
      if (Object.keys(initialAttributes).length > 0) {
        setSelectedAttributes(initialAttributes);
      }
    }
  }, [hasVariants, allAttributes, variantList]); // Depend on variantList to ensure it's ready

  // Fetch product availability considering paid orders
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!displayProduct._id) {
        setAvailableStock(0);
        setIsLoadingAvailability(false);
        return;
      }
      
      try {
        setIsLoadingAvailability(true);
        console.log('Fetching availability for product:', displayProduct._id);
        const response = await fetch(`/api/products/${displayProduct._id}/availability`);
        if (response.ok) {
          const data = await response.json();
          console.log('Availability API response:', data);
          setAvailableStock(data.availableStock || 0);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Availability API error:', response.status, errorData);
          // Fallback to displayProduct.stock if API fails
          setAvailableStock(displayProduct.stock || 0);
        }
      } catch (error) {
        console.error('Failed to fetch product availability:', error);
        // Fallback to displayProduct.stock if API fails
        setAvailableStock(displayProduct.stock || 0);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [displayProduct._id, displayProduct.stock]);

  // Check if product is already in cart and if adding would exceed stock
  const cartItem = cart?.items?.find(
    (item: any) => {
      const itemProductId = typeof item.product === 'string' ? item.product : item.product?._id;
      return itemProductId === displayProduct._id;
    }
  );
  const currentCartQuantity = cartItem?.quantity || 0;
  // Use availableStock if it's been fetched (not 0 or a valid number), otherwise use displayProduct.stock as fallback
  // But if isLoadingAvailability is true, we should wait
  const currentAvailableStock = isLoadingAvailability 
    ? 0 // While loading, assume 0 to disable button
    : (typeof availableStock === 'number' && availableStock >= 0) 
      ? availableStock 
      : (displayProduct.stock || 0);
  const maxCanAdd = Math.max(0, currentAvailableStock - currentCartQuantity);
  const canAddRequestedQuantity = quantity <= maxCanAdd;
  const isOutOfStock = currentAvailableStock === 0 && !isLoadingAvailability;
  const stockLimitReached = !isOutOfStock && !canAddRequestedQuantity;

  // Debug logging (remove in production)
  useEffect(() => {
    console.log('Stock Debug:', {
      availableStock,
      currentAvailableStock,
      currentCartQuantity,
      maxCanAdd,
      quantity,
      canAddRequestedQuantity,
      isOutOfStock,
      stockLimitReached,
      isAddingToCart,
      cartLoading,
      productId: displayProduct._id,
    });
  }, [availableStock, currentAvailableStock, currentCartQuantity, maxCanAdd, quantity, canAddRequestedQuantity, isOutOfStock, stockLimitReached, isAddingToCart, cartLoading, displayProduct._id]);

  const handleAddToCart = async () => {
    console.log('handleAddToCart called');
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    const productId = displayProduct._id;
    console.log('Product ID:', productId, 'Type:', typeof productId);

    if (!productId) {
      console.error('Product ID is missing');
      alert('Product ID is missing. Please refresh the page.');
      return;
    }

    if (isOutOfStock) {
      console.log('Product is out of stock');
      alert('This product is out of stock');
      return;
    }

    if (quantity > currentAvailableStock) {
      console.log('Quantity exceeds available stock');
      alert('Insufficient stock available');
      return;
    }

    if (!canAddRequestedQuantity) {
      console.log('Stock limit reached');
      alert(`Stock limit reached. You can add up to ${maxCanAdd} more item(s).`);
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
      displayProduct.images && displayProduct.images.length > 0
        ? typeof displayProduct.images[0] === 'string'
          ? displayProduct.images[0]
          : (displayProduct.images[0] as any)?.url || displayProduct.images[0]
        : undefined;

    // Trigger animation
    triggerAnimation(startPosition, productImage);

    try {
      console.log('Calling addToCart with:', { productId, quantity });
      setIsAddingToCart(true);
      await addToCart(String(productId), quantity);
      console.log('Product added to cart successfully');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const productId = displayProduct._id;

    try {
      setIsTogglingWishlist(true);
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const inWishlist = isInWishlist(displayProduct._id);

  // Keyboard navigation for fullscreen viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreenOpen) return;
      
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setFullscreenImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setFullscreenImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    if (isFullscreenOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreenOpen, images.length]);

  // Sync fullscreen index with selected image index
  useEffect(() => {
    if (isFullscreenOpen) {
      setFullscreenImageIndex(selectedImageIndex);
    }
  }, [isFullscreenOpen, selectedImageIndex]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/products" className="hover:text-gray-700">
                Products
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-gray-700"
              >
                {product.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100 relative group cursor-pointer" onClick={() => {
              if (displayImage && !isPlaceholderImage(displayImage) && !imageErrors.has(-1)) {
                setFullscreenImageIndex(selectedImageIndex);
                setIsFullscreenOpen(true);
              }
            }}>
              {displayImage && !isPlaceholderImage(displayImage) && !imageErrors.has(-1) ? (
                <>
                  <Image
                    src={displayImage}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                    onError={() => handleImageError(-1)}
                  />
                  {/* Fullscreen Icon Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg"
                    >
                      <FiMaximize2 className="w-6 h-6 text-[#000000]" />
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
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
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => {
                  const isPlaceholder = isPlaceholderImage(image);
                  const hasError = imageErrors.has(index);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:border-[#FC9BC2] ${
                        selectedImageIndex === index
                          ? 'border-[#F9629F] ring-2 ring-[#F9629F]/30'
                          : 'border-gray-200'
                      }`}
                    >
                      {!isPlaceholder && !hasError ? (
                        <Image
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
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
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex-1">
                  {product.name}
                </h1>
                {/* Flash Sale Badge */}
                {hasFlashSaleDiscount && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 flex-shrink-0"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <FiZap className="w-4 h-4" />
                    </motion.div>
                    <span className="text-xs font-black tracking-wide">FLASH</span>
                  </motion.div>
                )}
              </div>
              {/* Rating Display - Hidden for now, but kept for future use */}
              {false && (
                <div className="flex items-center space-x-4">
                  <ProductRating
                    rating={product.rating || 0}
                    numReviews={product.numReviews}
                  />
                  <span className="text-sm text-gray-500">
                    ({product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-4 mb-2">
                {hasFlashSaleDiscount ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl lg:text-5xl font-bold text-[#F9629F]">
                        {formatCurrency(displayPrice)}
                      </span>
                      <span className="text-2xl lg:text-3xl text-gray-400 line-through">
                        {formatCurrency(crossedOutPrice)}
                      </span>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="bg-[#FDE8F0] text-[#000000] border border-gray-300 rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center shadow-xl flex-shrink-0"
                    >
                      <div className="text-center">
                        <div className="text-sm lg:text-base font-black leading-tight">-{flashSaleDiscount}%</div>
                        <div className="text-[8px] lg:text-[10px] font-bold">OFF</div>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <span className="text-4xl lg:text-5xl font-bold text-[#F9629F]">
                    {formatCurrency(displayPrice)}
                  </span>
                )}
              </div>
              {/* BNPL Installment Options */}
              <BNPLInstallments price={displayPrice} />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Variant Selection - Show if product has 2+ variants (exclude spec-only attrs shown in Product Specifications) */}
            {hasVariants && Object.keys(allAttributes).length > 0 && (() => {
              const SPEC_ONLY_ATTR_KEYS = new Set(['Made_of', 'Origin', 'Size(inch)', 'Classification', 'With?', 'made_of', 'origin', 'size(inch)', 'classification', 'with?']);
              const selectableAttributes = Object.entries(allAttributes).filter(([key]) => !SPEC_ONLY_ATTR_KEYS.has(key));
              if (selectableAttributes.length === 0) return null;
              return (
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Select Options
                </h2>
                <div className="space-y-4">
                  {selectableAttributes.map(([key, values]) => {
                    const attributeValues = Array.from(values);
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    const isColor = key.toLowerCase().includes('color') || key.toLowerCase().includes('colour');

                    return (
                      <div key={key} className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">{label}:</div>
                        <div className="flex flex-wrap gap-2">
                          {attributeValues.map((value) => {
                            const isSelected = selectedAttributes[key] === value;
                            const variantWithValue = variantList.find((v) => {
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
                                  size="md"
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
                                onClick={() => {
                                  if (isAvailable) {
                                    handleAttributeSelect(key, value);
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`px-4 py-2 text-sm rounded border transition-colors ${
                                  isSelected
                                    ? 'bg-[#F9629F] text-white border-[#F9629F]'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#FC9BC2]'
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
              </div>
            );
            })()}

            {/* Product Attributes Section - Show for products without variants OR with variants (from selected variant) */}
            {(!hasVariants && product.attributes && Object.keys(product.attributes).length > 0) && (
              <div>
                <ProductAttributes
                  attributes={product.attributes}
                  categoryAttributes={product.categoryAttributes}
                />
              </div>
            )}
            {/* Product Specifications for variant products - use selected variant attributes */}
            {hasVariants && selectedVariant?.attributes && Object.keys(selectedVariant.attributes).length > 0 && (
              <div>
                <ProductAttributes
                  attributes={{ ...(product.attributes || {}), ...selectedVariant.attributes }}
                  categoryAttributes={product.categoryAttributes}
                />
              </div>
            )}

            {/* Category & Stock Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Category:
                </span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-sm text-[#F9629F] hover:text-[#DB7093] font-medium"
                >
                  {product.category}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Availability:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    currentAvailableStock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {currentAvailableStock > 0
                    ? `${currentAvailableStock} in stock`
                    : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Actions */}
            {currentAvailableStock > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity {currentCartQuantity > 0 && (
                    <span className="text-xs text-gray-500 font-normal">
                      ({currentCartQuantity} in cart, {maxCanAdd} available)
                    </span>
                  )}
                </label>
                <div className="flex items-center border border-gray-300 rounded-md w-fit mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex items-center justify-center w-10 h-10 text-lg font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent border-r border-gray-300"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxCanAdd}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), maxCanAdd));
                    }}
                    className="w-16 h-10 px-2 text-base font-medium text-gray-900 text-center border-0 focus:outline-none focus:ring-0 bg-transparent"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxCanAdd, quantity + 1))
                    }
                    className="flex items-center justify-center w-10 h-10 text-lg font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9629F] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent border-l border-gray-300"
                    aria-label="Increase quantity"
                    disabled={quantity >= maxCanAdd}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                ref={addToCartButtonRef}
                onClick={handleAddToCart}
                disabled={isLoadingAvailability || isOutOfStock || stockLimitReached || isAddingToCart || cartLoading}
                className="flex-1"
                size="lg"
              >
                {isLoadingAvailability
                  ? 'Loading...'
                  : isAddingToCart
                  ? 'Adding...'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : stockLimitReached
                  ? 'Stock Limit Reached'
                  : 'Add to Cart'}
              </Button>
              {isAuthenticated && (
                <button
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  className={`px-6 py-3 border-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                    inWishlist
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <svg
                    className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`}
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
                </button>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Fullscreen Image Viewer */}
        <AnimatePresence>
          {isFullscreenOpen && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
              onClick={() => setIsFullscreenOpen(false)}
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreenOpen(false);
                }}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300"
                aria-label="Close fullscreen"
              >
                <FiX className="w-6 h-6" />
              </motion.button>

              {/* Previous Button */}
              {images.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-300"
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </motion.button>
              )}

              {/* Next Button */}
              {images.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all duration-300"
                  aria-label="Next image"
                >
                  <FiChevronRight className="w-6 h-6" />
                </motion.button>
              )}

              {/* Image Container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {images[fullscreenImageIndex] && !isPlaceholderImage(images[fullscreenImageIndex]) ? (
                  <Image
                    src={images[fullscreenImageIndex]}
                    alt={`${product.name} - Image ${fullscreenImageIndex + 1}`}
                    width={1200}
                    height={1200}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    priority
                  />
                ) : (
                  <div className="w-full h-[60vh] flex items-center justify-center bg-gray-800 rounded-lg">
                    <svg
                      className="w-24 h-24 text-gray-400"
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

                {/* Image Counter */}
                {images.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {fullscreenImageIndex + 1} / {images.length}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Section - Hidden for now, but kept for future use */}
        {false && (
          <div className="mt-12">
            <ProductReviews
              productId={product._id || ''}
              reviews={[]}
              numReviews={product.numReviews || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
