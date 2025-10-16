// services/ai-processing/nano-banana.ts

/**
 * Interface for the request payload to Google Nano Banana API
 */
interface NanoBananaRequestPayload {
  primaryImage: string; // base64 encoded image
  referenceImages?: string[]; // array of base64 encoded images
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  settings?: {
    enhanceDetails?: boolean;
    preserveFaces?: boolean;
    styleStrength?: number; // 0-100
  };
}

/**
 * Interface for the response from Google Nano Banana API
 */
interface NanoBananaResponse {
  generatedImage: string; // base64 encoded image
  processingTime: number;
  status: 'success' | 'error';
  message?: string;
  metadata?: {
    promptAnalysis?: string;
    styleUsed?: string;
    aiConfidence?: number;
  };
}

/**
 * Processes an image using Google Nano Banana AI
 * 
 * @param payload - The request payload containing the image and processing instructions
 * @returns Promise with the processed image and metadata
 */
export async function generateImageWithNanoBanana(
  payload: NanoBananaRequestPayload
): Promise<NanoBananaResponse> {
  const API_KEY = process.env.GOOGLE_NANO_BANANA_API_KEY;
  const USE_SIMULATION = process.env.NODE_ENV === 'development' || !API_KEY;
  
  try {
    if (USE_SIMULATION) {
      return await simulateApiResponse(payload);
    }
    
    // Prepare the request headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };
    
    // In a real implementation, this would be the actual API endpoint
    const API_ENDPOINT = 'https://api.nanobanana.google.ai/v1/generate';
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to process image' }));
      throw new Error(errorData.message || 'Failed to process image');
    }
    
    const result = await response.json();
    
    if (!result.generatedImage) {
      throw new Error('No content received from the AI. The image might not have been generated successfully.');
    }
    
    return result;
  } catch (error) {
    console.error('Error generating image with Nano Banana:', error);
    
    // Provide a user-friendly error message
    if (error instanceof Error) {
      const errorMessage = error.message.includes('fetch') 
        ? 'Unable to connect to the AI service. Please check your internet connection.'
        : error.message;
      return {
        status: 'error',
        message: errorMessage,
        generatedImage: '',
        processingTime: 0
      };
    } else {
      return {
        status: 'error',
        message: 'Image processing failed for unknown reasons',
        generatedImage: '',
        processingTime: 0
      };
    }
  }
}

/**
 * Simulates an API response for development purposes
 * This function will be removed in production
 */
async function simulateApiResponse(payload: NanoBananaRequestPayload): Promise<NanoBananaResponse> {
  // Validate input
  if (!payload.primaryImage) {
    return {
      status: 'error',
      message: 'No primary image provided',
      generatedImage: '',
      processingTime: 0
    };
  }
  
  if (!payload.prompt || payload.prompt.trim().length === 0) {
    return {
      status: 'error',
      message: 'No prompt provided',
      generatedImage: '',
      processingTime: 0
    };
  }
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // For demo purposes, simply return the primary image
  // In reality, the API would transform the image based on the prompt
  return {
    generatedImage: payload.primaryImage, // Just return the input image for now
    processingTime: 2.5,
    status: 'success',
    message: 'Image processed successfully',
    metadata: {
      promptAnalysis: `Applied transformation based on: "${payload.prompt}"`,
      styleUsed: extractStyleFromPrompt(payload.prompt),
      aiConfidence: 0.89
    }
  };
}

/**
 * Extracts the style information from a prompt
 * This is a simple utility function for the simulation
 */
function extractStyleFromPrompt(prompt: string): string {
  const styleKeywords = [
    'oil painting', 'watercolor', 'sketch', 'cyberpunk', 
    'vintage', 'comic', 'anime', 'noir', 'retro', '80s'
  ];
  
  for (const style of styleKeywords) {
    if (prompt.toLowerCase().includes(style)) {
      return style;
    }
  }
  
  return 'natural';
}

/**
 * Utility: Converts a data URL to a Blob
 * Useful for file operations after processing
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Utility: Creates a downloadable link from an image
 */
export function createDownloadLink(image: string, filename: string): void {
  const link = document.createElement('a');
  link.href = image;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}