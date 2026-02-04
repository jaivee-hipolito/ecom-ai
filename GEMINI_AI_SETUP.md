# Gemini AI Product Description Generator Setup

## Overview

The product description generator uses Google's Gemini AI to automatically generate compelling, SEO-friendly product descriptions for your e-commerce products.

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Restart Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## Usage

1. Navigate to `/admin/products/create` or edit an existing product
2. Enter the product name (required)
3. Optionally select a category and fill in product attributes
4. Click the **"✨ Generate with AI"** button next to the Description field
5. The AI will generate a professional product description based on:
   - Product name
   - Category (if selected)
   - Product attributes (if filled in)
6. Review and edit the generated description as needed
7. Save the product

## Features

- **AI-Powered**: Uses Google's Gemini Pro model for high-quality descriptions
- **Context-Aware**: Considers product name, category, and attributes
- **SEO-Optimized**: Generates descriptions optimized for search engines
- **Editable**: Generated descriptions can be edited before saving
- **Admin-Only**: Only accessible to admin users

## API Endpoint

The feature uses the following API endpoint:

- **POST** `/api/admin/products/generate-description`
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "productName": "Product Name",
    "category": "Category Name (optional)",
    "attributes": {
      "attribute1": "value1",
      "attribute2": "value2"
    }
  }
  ```

## Troubleshooting

### Error: "Gemini API key is not configured"

- Make sure you've added `GEMINI_API_KEY` to your `.env.local` file
- Restart your development server after adding the key
- Check that the key is correct and has no extra spaces

### Error: "AI generation failed" or "model not found"

- The code uses `gemini-1.0-pro` model by default
- If you get a "model not found" error, check which models are available in your Google AI Studio account
- Some API keys may have access to different models
- Try updating the model name in `app/api/admin/products/generate-description/route.ts` to one of these:
  - `gemini-1.0-pro` (default)
  - `gemini-pro` (fallback)
  - `gemini-1.5-pro` (if available)
  - `gemini-1.5-flash` (if available)
- Check your internet connection
- Verify your API key is valid and has quota remaining
- Check the server console for detailed error messages

### Description not generating

- Ensure product name is filled in (required)
- Check browser console for errors
- Verify API key permissions

## Cost Considerations

- Google Gemini API has a free tier with generous limits
- Check [Google AI Studio Pricing](https://ai.google.dev/pricing) for current rates
- Monitor your API usage in Google AI Studio dashboard

