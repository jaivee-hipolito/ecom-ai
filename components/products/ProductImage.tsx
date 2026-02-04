'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IProduct } from '@/types/product';

interface ProductImageProps {
  product: IProduct;
  className?: string;
  priority?: boolean;
}

const PlaceholderIcon = ({ className }: { className?: string }) => (
  <svg
    className={className || 'w-12 h-12 text-gray-400'}
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
);

export default function ProductImage({
  product,
  className = '',
  priority = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  
  const imageUrl =
    product.coverImage ||
    (product.images && product.images.length > 0 ? product.images[0] : '');

  // Check if image URL is a placeholder or invalid
  const isPlaceholder =
    !imageUrl ||
    imageUrl.includes('example.com') ||
    imageUrl.startsWith('http://localhost') ||
    imageUrl === '';

  if (isPlaceholder || imageError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
      >
        <PlaceholderIcon />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
        alt={product.name}
        fill
        className="object-contain"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
