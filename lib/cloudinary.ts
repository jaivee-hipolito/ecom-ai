import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

// Validate Cloudinary configuration
if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.apiKey || !CLOUDINARY_CONFIG.apiSecret) {
  throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
}

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: CLOUDINARY_CONFIG.cloudName,
    api_key: CLOUDINARY_CONFIG.apiKey,
    api_secret: CLOUDINARY_CONFIG.apiSecret,
  });
} catch (configError: any) {
  console.error('Failed to configure Cloudinary:', configError);
  throw new Error(`Cloudinary configuration failed: ${configError.message}`);
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

    // Upload to Cloudinary with format detection
    return new Promise((resolve, reject) => {
      // Set a timeout for the upload (30 seconds)
      const uploadTimeout = setTimeout(() => {
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
        // Add error handling options
        invalidate: true,
        overwrite: false,
      };

      // Add format if detected (helps with HEIC/HEIF conversion)
      // Note: Cloudinary doesn't support format parameter in upload_stream, it auto-detects
      // But we can add it to transformation if needed
      
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            clearTimeout(uploadTimeout);
            
            if (error) {
              console.error('Cloudinary upload error details:', {
                message: error.message,
                http_code: (error as any).http_code,
                name: error.name,
                error: error,
              });
              
              // Provide more specific error messages
              let errorMessage = 'Failed to upload image';
              if ((error as any).http_code === 401) {
                errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
              } else if ((error as any).http_code === 400) {
                errorMessage = 'Invalid image file. Please try a different image.';
              } else if (error.message) {
                errorMessage = `Upload failed: ${error.message}`;
              }
              
              reject(new Error(errorMessage));
            } else if (result) {
              if (!result.secure_url) {
                reject(new Error('Upload succeeded but no image URL was returned'));
                return;
              }
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id || '',
                width: result.width || 0,
                height: result.height || 0,
              });
            } else {
              reject(new Error('Upload failed: No result returned from Cloudinary'));
            }
          }
        );

        // Handle stream errors
        uploadStream.on('error', (streamError: any) => {
          clearTimeout(uploadTimeout);
          console.error('Upload stream error:', streamError);
          reject(new Error(`Upload stream error: ${streamError.message || 'Unknown stream error'}`));
        });

        // Write buffer to stream
        uploadStream.end(buffer);
      } catch (streamCreationError: any) {
        clearTimeout(uploadTimeout);
        console.error('Failed to create upload stream:', streamCreationError);
        reject(new Error(`Failed to start upload: ${streamCreationError.message || 'Unknown error'}`));
      }
    });
  } catch (error: any) {
    console.error('Error in uploadImage function:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    
    // Don't wrap errors that are already Error objects with messages
    if (error instanceof Error && error.message) {
      throw error;
    }
    
    throw new Error(`Image upload failed: ${error?.message || 'Unknown error occurred'}`);
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
