'use client';

import { ICartItem } from '@/types/cart';
import { IProduct } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ColorSwatch from '@/components/products/ColorSwatch';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

interface CartItemProps {
  item: ICartItem;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export default function CartItem({ item, isSelected = true, onToggleSelect }: CartItemProps) {
  const { updateCartItem, removeFromCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Handle null or invalid product
  if (!item.product) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 text-center text-gray-500 border border-gray-200">
        Product no longer available
      </div>
    );
  }

  const product = typeof item.product === 'object' ? item.product : ({} as IProduct);
  const productId = typeof item.product === 'string' ? item.product : product._id || '';

  if (!productId) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 text-center text-gray-500 border border-gray-200">
        Product no longer available
      </div>
    );
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (product.stock || 0)) {
      return;
    }

    try {
      setIsUpdating(true);
      setQuantity(newQuantity);
      await updateCartItem(productId, newQuantity);
    } catch (error: any) {
      alert(error.message || 'Failed to update quantity');
      setQuantity(item.quantity); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this item from cart?')) {
      return;
    }

    try {
      setIsRemoving(true);
      await removeFromCart(productId);
    } catch (error: any) {
      alert(error.message || 'Failed to remove item');
      setIsRemoving(false);
    }
  };

  const imageUrl = product.coverImage || (product.images && product.images[0]) || '';
  const isPlaceholder = !imageUrl || imageUrl.includes('example.com') || imageUrl.startsWith('http://localhost');
  const totalPrice = (product.price || 0) * quantity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isSelected ? 1 : 0.6, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-visible group ${
        isSelected ? 'border-gray-100' : 'border-gray-300 border-dashed opacity-75'
      }`}
    >
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Selection Checkbox */}
        {onToggleSelect && (
          <div className="flex items-start pt-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleSelect}
              className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                isSelected
                  ? 'bg-gradient-to-br from-[#ffa509] to-[#ff8c00] border-[#ffa509] shadow-lg'
                  : 'bg-white border-gray-300 hover:border-[#ffa509]'
              }`}
              aria-label={isSelected ? 'Deselect item' : 'Select item'}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <FiCheck className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          </div>
        )}
        
        {/* Product Image */}
        <Link 
          href={(() => {
            const url = `/products/${productId}`;
            if (product.attributes && Object.keys(product.attributes).length > 0) {
              const params = new URLSearchParams();
              Object.entries(product.attributes).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                  params.append(key, String(value));
                }
              });
              const queryString = params.toString();
              return queryString ? `${url}?${queryString}` : url;
            }
            return url;
          })()}
          className="flex-shrink-0 self-center sm:self-auto"
        >
          <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-[#ffa509] transition-colors">
            {imageUrl && !isPlaceholder ? (
              <Image
                src={imageUrl}
                alt={product.name || 'Product'}
                fill
                sizes="(max-width: 640px) 96px, 128px"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
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
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-w-0">
            <Link 
              href={(() => {
                const url = `/products/${productId}`;
                if (product.attributes && Object.keys(product.attributes).length > 0) {
                  const params = new URLSearchParams();
                  Object.entries(product.attributes).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                      params.append(key, String(value));
                    }
                  });
                  const queryString = params.toString();
                  return queryString ? `${url}?${queryString}` : url;
                }
                return url;
              })()}
            >
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#050b2c] hover:text-[#ffa509] transition-colors mb-2 line-clamp-2">
                {product.name || 'Product'}
              </h3>
            </Link>
            
            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2 mb-2">
              <span className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent whitespace-nowrap">
                {formatCurrency(product.price || 0)}
              </span>
              {product.stock !== undefined && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  • Stock: <span className="font-semibold text-gray-700">{product.stock}</span>
                </span>
              )}
            </div>
            
            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.attributes).slice(0, 3).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') {
                      return null;
                    }

                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim();

                    // Handle color attributes
                    if (
                      (key.toLowerCase().includes('color') ||
                        key.toLowerCase().includes('colour')) &&
                      typeof value === 'string'
                    ) {
                      if (!value.includes(',')) {
                        return (
                          <div key={key} className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-600">{label}:</span>
                            <ColorSwatch color={value} size="sm" />
                            <span className="text-xs text-gray-700 capitalize">{value}</span>
                          </div>
                        );
                      }
                    }

                    // Default display
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-600">{label}:</span>
                        <span className="text-xs text-gray-700">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 xs:gap-4 sm:gap-6">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 w-full xs:w-auto justify-center xs:justify-start">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating || isLoading}
                className="p-2 rounded-lg bg-white hover:bg-[#ffa509] hover:text-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FiMinus className="w-4 h-4" />
              </motion.button>
              <input
                type="number"
                min="1"
                max={product.stock || 999}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleQuantityChange(val);
                }}
                disabled={isUpdating || isLoading}
                className="w-12 sm:w-16 px-2 py-2 text-center font-bold text-[#050b2c] bg-transparent border-none focus:outline-none disabled:opacity-50 text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (product.stock || 999) || isUpdating || isLoading}
                className="p-2 rounded-lg bg-white hover:bg-[#ffa509] hover:text-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Total Price */}
            <div className="flex-1 xs:flex-none text-left xs:text-right min-w-[120px] xs:min-w-[140px]">
              <p className="text-xs text-gray-500 mb-1 whitespace-nowrap">Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#ffa509] to-[#ff8c00] bg-clip-text text-transparent whitespace-nowrap overflow-visible">
                {formatCurrency(totalPrice)}
              </p>
            </div>

            {/* Remove Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemove}
              disabled={isLoading || isRemoving}
              className="p-2 sm:p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-sm self-center xs:self-auto"
              aria-label="Remove item"
            >
              <FiTrash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
