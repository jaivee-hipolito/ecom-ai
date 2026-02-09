import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

// Configure Cloudinary with error handling
try {
  if (CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.apiKey && CLOUDINARY_CONFIG.apiSecret) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CONFIG.cloudName,
      api_key: CLOUDINARY_CONFIG.apiKey,
      api_secret: CLOUDINARY_CONFIG.apiSecret,
      secure: true, // Always use HTTPS
    });
  } else {
    console.warn('Cloudinary configuration is incomplete. Image uploads will fail.');
  }
} catch (configError: any) {
  console.error('Error configuring Cloudinary:', configError);
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export async function uploadImage(
  file: File | Buffer,
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    // Convert File to buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('File is empty or could not be read');
        }
        buffer = Buffer.from(arrayBuffer);
        if (!buffer || buffer.length === 0) {
          throw new Error('Failed to convert file to buffer');
        }
      } catch (conversionError: any) {
        throw new Error(`Failed to process file: ${conversionError.message}`);
      }
    } else {
      buffer = file;
      if (!buffer || buffer.length === 0) {
        throw new Error('Buffer is empty');
      }
    }

    // Detect file format for better handling (especially mobile formats like HEIC)
    let format: string | undefined;
    if (file instanceof File) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        format = 'heic';
      } else if (fileName.endsWith('.webp')) {
        format = 'webp';
      } else if (fileName.endsWith('.png')) {
        format = 'png';
      } else if (fileName.endsWith('.gif')) {
        format = 'gif';
      }
    }

    // Validate Cloudinary configuration before attempting upload
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.apiKey || !CLOUDINARY_CONFIG.apiSecret) {
      throw new Error('Cloudinary is not properly configured. Please check your environment variables.');
    }

    // Upload to Cloudinary with format detection
    return new Promise((resolve, reject) => {
      // Set a timeout for the upload (30 seconds)
      const timeout = setTimeout(() => {
        reject(new Error('Upload timeout: The upload took too long. Please try again with a smaller image.'));
      }, 30000);

      const uploadOptions: any = {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
        // Add timeout to Cloudinary options
        timeout: 30000,
      };

      // Add format if detected (helps with HEIC/HEIF conversion)
      // Note: Don't set format for HEIC - let Cloudinary auto-detect and convert
      if (format && format !== 'heic') {
        uploadOptions.format = format;
      }

      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            clearTimeout(timeout);
            
            if (error) {
              console.error('Cloudinary upload error:', error);
              console.error('Error details:', {
                http_code: (error as any).http_code,
                message: (error as any).message,
                name: (error as any).name,
              });
              
              // Sanitize error message - remove HTML if present
              let errorMessage = 'Failed to upload image';
              if (error && typeof error === 'object') {
                const errorObj = error as any;
                if (errorObj.message) {
                  // Check if message contains HTML
                  if (errorObj.message.includes('<!DOCTYPE') || errorObj.message.includes('<html')) {
                    errorMessage = 'Cloudinary service error. Please try again or contact support.';
                  } else {
                    errorMessage = errorObj.message;
                  }
                } else if (errorObj.http_code) {
                  errorMessage = `Upload failed with HTTP ${errorObj.http_code}. Please check your Cloudinary configuration.`;
                }
              }
              
              reject(new Error(errorMessage));
            } else if (result) {
              if (!result.secure_url) {
                reject(new Error('Upload succeeded but no URL was returned'));
                return;
              }
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id || '',
                width: result.width || 0,
                height: result.height || 0,
              });
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          }
        );

        // Handle stream errors
        uploadStream.on('error', (streamError: any) => {
          clearTimeout(timeout);
          console.error('Upload stream error:', streamError);
          
          // Sanitize stream error message
          let errorMessage = 'Upload stream error occurred';
          if (streamError && streamError.message) {
            if (streamError.message.includes('<!DOCTYPE') || streamError.message.includes('<html')) {
              errorMessage = 'Cloudinary service error. Please try again.';
            } else {
              errorMessage = streamError.message;
            }
          }
          
          reject(new Error(errorMessage));
        });

        // Write buffer to stream
        uploadStream.end(buffer);
      } catch (streamCreationError: any) {
        clearTimeout(timeout);
        console.error('Error creating upload stream:', streamCreationError);
        reject(new Error(`Failed to initialize upload: ${streamCreationError.message || 'Unknown error'}`));
      }
    });
  } catch (error: any) {
    console.error('Error in uploadImage function:', error);
    throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param url Cloudinary image URL
 * @returns public_id or null if extraction fails
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // or: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
}

export default cloudinary;
