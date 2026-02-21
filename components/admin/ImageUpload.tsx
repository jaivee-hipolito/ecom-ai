'use client';

import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        // Upload to Cloudinary via API
        const formData = new FormData();
        formData.append('image', file);

        let response: Response;
        try {
          response = await fetch('/api/products/upload-image', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it with boundary for FormData
          });
        } catch (networkError: any) {
          console.error('Network error during upload:', networkError);
          throw new Error('Network error. Please check your connection and try again.');
        }

        // Check if response is OK
        if (!response.ok) {
          // Always read as text first to avoid JSON parse errors on HTML error pages
          // (e.g. 500 body size limit returns HTML, not JSON)
          let errorMessage = 'Upload failed';
          try {
            const textResponse = await response.text();
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              try {
                const errorData = JSON.parse(textResponse);
                errorMessage = errorData.error || `Upload failed with status ${response.status}`;
              } catch {
                // Response claimed JSON but body wasn't valid JSON (e.g. HTML)
                errorMessage = response.status === 500
                  ? 'Image may be too large or upload failed. Try a smaller image (max 5MB) or check your connection.'
                  : `Upload failed with status ${response.status}. Please try again.`;
              }
            } else {
              // HTML or other non-JSON (common when body size limit exceeded on mobile)
              console.error('Non-JSON error response:', textResponse.substring(0, 200));
              errorMessage = response.status === 500
                ? 'Image may be too large or upload failed. Try a smaller image (max 5MB) or use a different device.'
                : `Server error (${response.status}). Please try again.`;
            }
          } catch (readError: any) {
            console.error('Error reading error response:', readError);
            errorMessage = response.status === 500
              ? 'Image may be too large or upload failed. Try a smaller image (max 5MB).'
              : `Upload failed with status ${response.status}. Please try again.`;
          }
          throw new Error(errorMessage);
        }

        // Parse successful response
        let data: any;
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Non-JSON success response:', textResponse.substring(0, 200));
            throw new Error('Invalid response format from server');
          }
          data = await response.json();
        } catch (parseError: any) {
          console.error('Error parsing success response:', parseError);
          throw new Error('Failed to parse server response. Please try again.');
        }

        console.log('Upload response:', data);
        if (data.imageUrl) {
          newImages.push(data.imageUrl);
          console.log('Added image URL:', data.imageUrl);
        } else {
          console.error('No imageUrl in response:', data);
          throw new Error('Invalid response from server: missing image URL');
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
              <div key={index} className="relative group">
                {/* Image Container */}
                <div
                  className={`relative w-full h-24 sm:h-28 md:h-32 rounded-lg overflow-hidden border-2 ${
                    isCover
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  }`}
                >
                  {/* Image - Base Layer */}
                  <img
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ display: 'block', position: 'relative', zIndex: 1 }}
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#f3f4f6';
                      target.alt = 'Failed to load image';
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', imageUrl);
                    }}
                  />
                  
                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded z-10 shadow-md">
                      Cover
                    </div>
                  )}

                  {/* Hover Overlay - Only appears on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 rounded-lg flex items-center justify-center z-20 pointer-events-none group-hover:pointer-events-auto">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      {/* Set as Cover Button */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => setAsCover(imageUrl)}
                          className="bg-blue-600 text-white rounded p-1.5 hover:bg-blue-700 transition-colors shadow-lg"
                          title="Set as cover image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Move Up Button */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'up')}
                          className="bg-gray-700 text-white rounded p-1.5 hover:bg-gray-800 transition-colors shadow-lg"
                          title="Move up"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Move Down Button */}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'down')}
                          className="bg-gray-700 text-white rounded p-1.5 hover:bg-gray-800 transition-colors shadow-lg"
                          title="Move down"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-600 text-white rounded p-1.5 hover:bg-red-700 transition-colors shadow-lg"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
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
