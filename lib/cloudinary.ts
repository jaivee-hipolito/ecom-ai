import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

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
      const uploadOptions: any = {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      };

      // Add format if detected (helps with HEIC/HEIF conversion)
      if (format) {
        uploadOptions.format = format;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
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
        console.error('Upload stream error:', streamError);
        reject(new Error(`Upload stream error: ${streamError.message || 'Unknown error'}`));
      });

      uploadStream.end(buffer);
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
