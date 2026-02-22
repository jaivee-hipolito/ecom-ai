'use client';

import { useState, useRef, useEffect } from 'react';
import { FiImage, FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface ImageUploadProps {
  images: string[];
  coverImage?: string;
  onImagesChange: (images: string[]) => void;
  onCoverImageChange?: (coverImage: string) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  coverImage,
  onImagesChange,
  onCoverImageChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeIndex === null) return;
      const target = e.target as HTMLElement;
      if (!target.closest('[data-image-upload-item]')) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIndex]);

  // Set first image as cover if no cover is set
  const currentCoverImage = coverImage || (images.length > 0 ? images[0] : '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const newImages: string[] = [];
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        setUploading(false);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToUpload) {
        // Enhanced validation for mobile compatibility
        // Mobile browsers (especially iOS) sometimes don't set file.type correctly
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        const hasValidMimeType = file.type && file.type.startsWith('image/');

        if (!hasValidMimeType && !hasValidExtension) {
          setError(`Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP, or HEIC)`);
          setUploading(false);
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`Image "${file.name}" is too large. Maximum size is 5MB`);
          setUploading(false);
          return;
        }

        // Validate file is not empty
        if (file.size === 0) {
          setError(`Image "${file.name}" appears to be empty`);
          setUploading(false);
          return;
        }

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        // Direct upload to Cloudinary (bypasses Vercel 4.5MB body limit)
        const useDirectUpload = cloudName && uploadPreset;

        let imageUrl: string;

        if (useDirectUpload) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          formData.append('folder', 'products');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
          );

          const text = await response.text();
          if (!response.ok) {
            let errMsg = 'Upload failed';
            try {
              const err = JSON.parse(text);
              errMsg = err?.error?.message || err?.error || errMsg;
            } catch {
              errMsg = response.status === 413
                ? 'Image too large. Try a smaller image (max 5MB).'
                : 'Upload failed. Please try again.';
            }
            throw new Error(errMsg);
          }

          const data = JSON.parse(text);
          imageUrl = data.secure_url;
        } else {
          // Fallback: upload via API (subject to Vercel 4.5MB limit in production)
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('/api/products/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const textResponse = await response.text();
            let errorMessage = 'Upload failed';
            try {
              const err = JSON.parse(textResponse);
              errorMessage = err?.error || errorMessage;
            } catch {
              errorMessage = response.status === 500
                ? 'Image may be too large or upload failed. Try a smaller image (max 5MB).'
                : `Upload failed (${response.status}). Please try again.`;
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          imageUrl = data.imageUrl;
        }

        if (imageUrl) {
          newImages.push(imageUrl);
        } else {
          throw new Error('Invalid response: missing image URL');
        }
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);

      // Set first uploaded image as cover if no cover exists
      if (!coverImage && newImages.length > 0 && onCoverImageChange) {
        onCoverImageChange(newImages[0]);
      }

      setUploading(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // If removed image was cover, set first image as cover
    if (imageToRemove === currentCoverImage && newImages.length > 0 && onCoverImageChange) {
      onCoverImageChange(newImages[0]);
    } else if (newImages.length === 0 && onCoverImageChange) {
      onCoverImageChange('');
    }
  };

  const setAsCover = (imageUrl: string) => {
    if (onCoverImageChange) {
      onCoverImageChange(imageUrl);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    onImagesChange(newImages);

    // If moving cover image, update cover
    if (images[index] === currentCoverImage && onCoverImageChange) {
      onCoverImageChange(newImages[targetIndex]);
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-2 sm:space-y-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        Product Images ({images.length}/{maxImages})
      </label>
      <p className="text-xs sm:text-sm text-gray-500">
        The first image or selected cover image will be used as the main product image.
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Image Preview Grid — compact on mobile */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {images.map((imageUrl, index) => {
            const isCover = imageUrl === currentCoverImage;
            return (
              <div key={index} className="relative group" data-image-upload-item>
                {/* Image Container */}
                <div
                  className={`relative w-full h-24 sm:h-28 md:h-32 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    isCover
                      ? 'border-[#F9629F] ring-2 ring-[#F9629F]/30 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Image - Base Layer */}
                  <img
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ display: 'block', position: 'relative', zIndex: 1 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#f3f4f6';
                      target.alt = 'Failed to load image';
                    }}
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white text-xs font-semibold shadow-lg flex items-center gap-1">
                      <FiImage className="w-3.5 h-3.5" />
                      Cover
                    </div>
                  )}

                  {/* Position Badge */}
                  <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                    #{index + 1}
                  </div>

                  {/* Overlay - appears on hover (desktop) or tap (mobile/tablet) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIndex(activeIndex === index ? null : index);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveIndex(activeIndex === index ? null : index);
                      }
                    }}
                    className={`absolute inset-0 transition-all duration-200 rounded-xl flex items-end justify-center z-20 cursor-pointer
                      ${activeIndex === index ? 'bg-black/70' : 'bg-black/0 group-hover:bg-black/70'}`}
                  >
                    <div
                      className={`w-full p-2 sm:p-2.5 transition-opacity duration-200
                        ${activeIndex === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'}`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                            {/* Set as Cover */}
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => { setAsCover(imageUrl); setActiveIndex(null); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-[#F9629F] to-[#DB7093] text-white text-xs font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                              >
                                <FiImage className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Cover</span>
                              </button>
                            )}

                            {/* Move Up */}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, 'up')}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/90 text-gray-800 text-xs font-semibold hover:bg-white transition-all hover:scale-105 active:scale-95"
                                title="Move up"
                              >
                                <FiArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Up</span>
                              </button>
                            )}

                            {/* Move Down */}
                            {index < images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, 'down')}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/90 text-gray-800 text-xs font-semibold hover:bg-white transition-all hover:scale-105 active:scale-95"
                                title="Move down"
                              >
                                <FiArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">Down</span>
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-red-500/90 text-white text-xs font-semibold hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
                              title="Remove image"
                            >
                              <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                    </div>
                    {/* Fallback for group-hover when not using tap */}
                    {activeIndex !== index && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-white/90 text-xs font-medium px-3 py-1.5 rounded-lg bg-black/50">Tap for options</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Images'}
          </Button>
          <p className="mt-2 text-sm text-gray-500">
            Upload up to {maxImages - images.length} more image(s). Max 5MB per image.
          </p>
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 text-center">
          <svg
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Click to upload
            </button>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB (Multiple images supported)
          </p>
        </div>
      )}
    </div>
  );
}
