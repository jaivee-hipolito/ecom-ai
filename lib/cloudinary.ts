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
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url || '',
              public_id: result.public_id || '',
              width: result.width || 0,
              height: result.height || 0,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    throw new Error(`Image upload failed: ${error.message}`);
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
