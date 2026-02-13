import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

// Force Node.js runtime for Cloudinary
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check admin access first
    try {
      await requireAdmin();
    } catch (authError: any) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message === 'Forbidden: Admin access required' ? 'Unauthorized' : 'Authentication failed' },
        { status: 403 }
      );
    }

    // Parse form data with better error handling
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error('FormData parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid form data. Please try again.' },
        { status: 400 }
      );
    }

    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Enhanced file validation for mobile compatibility
    // Mobile browsers sometimes don't set file.type correctly
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = file.type && file.type.startsWith('image/');

    if (!hasValidMimeType && !hasValidExtension) {
      return NextResponse.json(
        { error: 'File must be an image (JPG, PNG, GIF, WEBP, or HEIC)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Image file is empty' },
        { status: 400 }
      );
    }

    // Validate Cloudinary configuration before attempting upload
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return NextResponse.json(
        { error: 'Image upload service is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Upload to Cloudinary with better error handling
    let result;
    try {
      result = await uploadImage(file, 'products');
    } catch (uploadError: any) {
      console.error('Cloudinary upload error:', uploadError);
      console.error('Upload error stack:', uploadError.stack);
      
      // Extract a user-friendly error message
      let errorMessage = 'Failed to upload image to storage. Please try again.';
      if (uploadError.message) {
        errorMessage = uploadError.message;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    if (!result || !result.secure_url) {
      return NextResponse.json(
        { error: 'Upload succeeded but no image URL was returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    // Catch-all error handler to ensure JSON is always returned
    console.error('Unexpected error uploading image:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Check if error has a response property (might be a fetch error)
    if (error?.response) {
      console.error('Error has response property:', error.response);
    }
    
    // Extract error message safely
    let errorMessage = 'An unexpected error occurred while uploading the image. Please try again.';
    if (error?.message) {
      // Clean up error message - remove any HTML or JSON parsing errors
      const cleanMessage = error.message
        .replace(/SyntaxError:.*/g, '')
        .replace(/<!DOCTYPE.*/g, '')
        .trim();
      if (cleanMessage) {
        errorMessage = cleanMessage;
      }
    }
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.stack,
          errorType: error?.name,
        })
      },
      { status: 500 }
    );
  }
}
