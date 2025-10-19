// services/geminiService.ts
import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ GEMINI_API_KEY is not set in environment variables');
}

// Initialize with Google Gen AI (supports Nano Banana image generation)
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface ImageGenerationParams {
  primaryImage: string; // base64 data URL
  referenceImages?: string[]; // base64 data URLs
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  generatedImage?: string; // base64 data URL
  error?: string;
  metadata?: {
    model: string;
    timestamp: number;
    prompt: string;
  };
}

/**
 * Convert base64 data URL to inline data format
 */
function base64ToInlineData(dataUrl: string) {
  const base64Data = dataUrl.split(',')[1];
  const mimeType = dataUrl.split(';')[0].split(':')[1];
  
  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg',
    },
  };
}

/**
 * Generate image using Nano Banana (Gemini 2.5 Flash Image)
 */
export async function generateImageWithGemini(
  params: ImageGenerationParams
): Promise<ImageGenerationResult> {
  try {
    if (!API_KEY || !genAI) {
      throw new Error('Gemini API key is not configured');
    }

    // Construct prompt with image editing instructions
    let fullPrompt = params.prompt;
    
    if (params.referenceImages && params.referenceImages.length > 0) {
      fullPrompt = `Transform the first image based on this instruction: ${params.prompt}. `;
      fullPrompt += `Use the following reference images for style guidance. `;
      fullPrompt += `Maintain the composition of the first image while applying the transformation.`;
    }

    if (params.aspectRatio && params.aspectRatio !== '1:1') {
      fullPrompt += ` Output aspect ratio should be ${params.aspectRatio}.`;
    }

    // Prepare content parts for the request
    const parts: any[] = [
      { text: fullPrompt },
      base64ToInlineData(params.primaryImage),
    ];

    // Add reference images if provided
    if (params.referenceImages && params.referenceImages.length > 0) {
      params.referenceImages.forEach(refImg => {
        parts.push(base64ToInlineData(refImg));
      });
    }

    const config = {
      responseModalities: ['IMAGE', 'TEXT'],
    };

    const model = 'gemini-2.5-flash-image'; // Nano Banana model
    const contents = [
      {
        role: 'user',
        parts,
      },
    ];

    // Generate content using streaming API
    const response = await genAI.models.generateContentStream({
      model,
      config,
      contents,
    });

    let generatedImageData: string | null = null;
    let generatedMimeType: string | null = null;
    let textResponse = '';

    // Process stream chunks
    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0]?.content?.parts) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;
      
      // Check for image data
      for (const part of parts) {
        if (part.inlineData) {
          generatedImageData = part.inlineData.data || null;
          generatedMimeType = part.inlineData.mimeType || null;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!generatedImageData || !generatedMimeType) {
      throw new Error(
        textResponse || 'Gemini did not return an image. Try rephrasing your prompt.'
      );
    }

    const generatedImage = `data:${generatedMimeType};base64,${generatedImageData}`;

    return {
      success: true,
      generatedImage,
      metadata: {
        model: 'gemini-2.5-flash-image',
        timestamp: Date.now(),
        prompt: fullPrompt,
      },
    };

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    let errorMessage = 'Failed to generate image';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Handle specific error cases
    if (errorMessage.includes('API key')) {
      errorMessage = 'Invalid or missing Gemini API key. Please check your .env.local file.';
    } else if (errorMessage.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later or check your Gemini billing.';
    } else if (errorMessage.includes('safety')) {
      errorMessage = 'Content filtered by safety settings. Please try a different prompt.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Test Gemini API connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    if (!API_KEY || !genAI) {
      console.error('❌ No API key configured');
      return false;
    }

    // Simple test with text generation
    const response = await genAI.models.generateContentStream({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Test connection' }],
        },
      ],
    });

    // Just check if we get a response
    for await (const chunk of response) {
      if (chunk) {
        console.log('✅ Gemini API connected successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Gemini API connection failed:', error);
    return false;
  }
}