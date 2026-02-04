export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'teezee_products',
};

if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.apiKey || !CLOUDINARY_CONFIG.apiSecret) {
  console.warn('Cloudinary configuration is missing. Image uploads will not work.');
}
