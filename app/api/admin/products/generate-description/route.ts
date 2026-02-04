import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAdmin } from '@/lib/auth';

// Force Node.js runtime for AI SDK
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { productName, category, attributes } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.0-pro (stable model name)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt
    let prompt = `Generate a compelling, SEO-friendly product description for an e-commerce website. 

Product Name: ${productName}`;

    if (category) {
      prompt += `\nCategory: ${category}`;
    }

    if (attributes && Object.keys(attributes).length > 0) {
      prompt += `\n\nProduct Attributes:`;
      Object.entries(attributes).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          prompt += `\n- ${key}: ${value}`;
        }
      });
    }

    prompt += `\n\nRequirements:
- Write a professional, engaging product description (150-300 words)
- Structure it with clear paragraphs (2-4 paragraphs)
- Each paragraph should focus on a specific aspect (overview, features, benefits, conclusion)
- Use professional, persuasive language suitable for e-commerce
- Include relevant details from the attributes provided
- Make it SEO-friendly with natural keyword usage
- Format it in plain text with proper paragraph breaks (double line breaks between paragraphs)
- Focus on customer benefits and value proposition
- Use proper capitalization and punctuation
- Avoid excessive marketing jargon - be professional and informative
- Each paragraph should be 3-5 sentences

Generate the product description now:`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let description = response.text();

      if (!description || description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Failed to generate description. Please try again.' },
          { status: 500 }
        );
      }

      // Format the description for better readability
      description = description.trim();
      
      // Ensure proper paragraph breaks (replace multiple newlines with double newline)
      description = description.replace(/\n{3,}/g, '\n\n');
      
      // Ensure paragraphs are separated by double line breaks
      description = description.replace(/\n\n\n+/g, '\n\n');
      
      // Clean up any extra whitespace
      description = description.split('\n').map(line => line.trim()).join('\n');
      
      // Ensure proper paragraph structure
      const paragraphs = description.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      description = paragraphs.join('\n\n');

      return NextResponse.json({
        success: true,
        description: description,
      });
    } catch (aiError: any) {
      console.error('Gemini AI Error:', aiError);
      
      // If model not found, try alternative model names
      if (aiError.message && aiError.message.includes('not found')) {
        console.log('Trying alternative model: gemini-pro');
        try {
          const altModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
          const result = await altModel.generateContent(prompt);
          const response = await result.response;
          const description = response.text();
          
          if (description && description.trim().length > 0) {
            return NextResponse.json({
              success: true,
              description: description.trim(),
            });
          }
        } catch (altError: any) {
          console.error('Alternative model also failed:', altError);
        }
      }
      
      return NextResponse.json(
        { 
          error: `AI generation failed: ${aiError.message || 'Unknown error'}. Please check your API key and available models.` 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating description:', error);
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}

