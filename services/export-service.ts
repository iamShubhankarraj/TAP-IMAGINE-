// services/export-service.ts

import { 
  ExportConfig, 
  ExportJob, 
  ImageAdjustments, 
  FilenameTokens,
  ExportPreset 
} from '@/types/export';

/**
 * Applies image adjustments and filters to a canvas
 */
function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  adjustments: ImageAdjustments
): void {
  const { brightness, contrast, saturation, filter } = adjustments;
  
  // Build CSS filter string
  const filterParts: string[] = [];
  
  if (brightness !== 0) {
    filterParts.push(`brightness(${100 + brightness}%)`);
  }
  
  if (contrast !== 0) {
    filterParts.push(`contrast(${100 + contrast}%)`);
  }
  
  if (saturation !== 0) {
    filterParts.push(`saturate(${100 + saturation}%)`);
  }
  
  // Apply preset filters
  if (filter) {
    switch (filter) {
      case 'vintage':
        filterParts.push('sepia(0.6) contrast(1.1) brightness(0.9) saturate(1.2)');
        break;
      case 'bw':
        filterParts.push('grayscale(1)');
        break;
      case 'sepia':
        filterParts.push('sepia(1)');
        break;
      case 'cool':
        filterParts.push('hue-rotate(-20deg)');
        break;
      case 'warm':
        filterParts.push('hue-rotate(20deg)');
        break;
      case 'film':
        filterParts.push('contrast(1.2) saturate(0.8)');
        break;
    }
  }
  
  ctx.filter = filterParts.join(' ');
}

/**
 * Applies output sharpening to the canvas
 */
function applySharpenging(
  ctx: CanvasRenderingContext2D,
  level: string
): void {
  // Sharpening is simulated by increasing contrast slightly
  // In a real implementation, you would use convolution matrices
  const sharpenValues = {
    none: 0,
    low: 1.05,
    medium: 1.1,
    high: 1.15
  };
  
  const value = sharpenValues[level as keyof typeof sharpenValues] || 1;
  if (value > 1) {
    const currentFilter = ctx.filter;
    ctx.filter = `${currentFilter} contrast(${value})`;
  }
}

/**
 * Processes an image with the given configuration and adjustments
 */
export async function processExportJob(
  job: ExportJob
): Promise<Blob> {
  const { config, imageUrl, adjustments } = job;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate dimensions based on rotation
        const isRotated = adjustments.rotation === 90 || adjustments.rotation === 270;
        const originalWidth = isRotated ? img.height : img.width;
        const originalHeight = isRotated ? img.width : img.height;
        
        // Calculate target dimensions based on resize config
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;
        
        const { resize } = config;
        
        if (resize.mode !== 'none') {
          switch (resize.mode) {
            case 'edge':
              if (resize.width && resize.height) {
                targetWidth = resize.width;
                targetHeight = resize.height;
                if (resize.maintainAspectRatio) {
                  const aspectRatio = originalWidth / originalHeight;
                  if (targetWidth / targetHeight > aspectRatio) {
                    targetWidth = targetHeight * aspectRatio;
                  } else {
                    targetHeight = targetWidth / aspectRatio;
                  }
                }
              } else if (resize.width) {
                targetWidth = resize.width;
                if (resize.maintainAspectRatio) {
                  targetHeight = targetWidth * (originalHeight / originalWidth);
                }
              } else if (resize.height) {
                targetHeight = resize.height;
                if (resize.maintainAspectRatio) {
                  targetWidth = targetHeight * (originalWidth / originalHeight);
                }
              }
              break;
              
            case 'percentage':
              if (resize.percentage) {
                const scale = resize.percentage / 100;
                targetWidth = originalWidth * scale;
                targetHeight = originalHeight * scale;
              }
              break;
              
            case 'megapixel':
              if (resize.megapixels) {
                const totalPixels = resize.megapixels * 1000000;
                const aspectRatio = originalWidth / originalHeight;
                targetHeight = Math.sqrt(totalPixels / aspectRatio);
                targetWidth = targetHeight * aspectRatio;
              }
              break;
          }
        }
        
        // Set canvas dimensions
        canvas.width = Math.round(targetWidth);
        canvas.height = Math.round(targetHeight);
        
        // Handle background
        if (config.background !== 'transparent') {
          switch (config.background) {
            case 'white':
              ctx.fillStyle = '#FFFFFF';
              break;
            case 'black':
              ctx.fillStyle = '#000000';
              break;
            case 'custom':
              ctx.fillStyle = config.customBackgroundColor || '#FFFFFF';
              break;
          }
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Apply adjustments
        ctx.save();
        applyAdjustments(ctx, adjustments);
        applySharpenging(ctx, config.outputSharpening);
        
        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(adjustments.rotation * Math.PI / 180);
        
        // Draw image
        const drawX = isRotated ? -originalHeight / 2 : -originalWidth / 2;
        const drawY = isRotated ? -originalWidth / 2 : -originalHeight / 2;
        
        if (resize.mode === 'none') {
          ctx.drawImage(img, drawX, drawY);
        } else {
          ctx.drawImage(
            img, 
            -canvas.width / 2, 
            -canvas.height / 2, 
            canvas.width, 
            canvas.height
          );
        }
        
        ctx.restore();
        
        // Convert to blob with appropriate format and quality
        const mimeType = getMimeType(config.format);
        const quality = config.quality / 100;
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.src = imageUrl;
  });
}

/**
 * Gets the MIME type for a given export format
 */
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    tiff: 'image/tiff',
    heif: 'image/heif',
    avif: 'image/avif',
    // Note: PSD, PSB, and DNG are not natively supported by canvas
    // In a real implementation, you'd need specialized libraries
    psd: 'image/png',
    psb: 'image/png',
    dng: 'image/png',
  };
  
  return mimeTypes[format] || 'image/png';
}

/**
 * Generates a filename from a template and tokens
 */
export function generateFilename(
  template: string,
  tokens: FilenameTokens,
  format: string
): string {
  let filename = template;
  
  // Replace tokens
  Object.entries(tokens).forEach(([key, value]) => {
    filename = filename.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  
  // Ensure proper extension
  const extension = format === 'jpeg' ? 'jpg' : format;
  if (!filename.toLowerCase().endsWith(`.${extension}`)) {
    filename += `.${extension}`;
  }
  
  return filename;
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Default export presets
 */
export const DEFAULT_PRESETS: ExportPreset[] = [
  {
    id: 'instagram',
    name: 'Instagram Post',
    description: '1080x1080, JPEG 85%',
    icon: 'Instagram',
    configs: [
      {
        id: 'instagram-1',
        name: 'Instagram Post',
        format: 'jpeg',
        quality: 85,
        resize: {
          mode: 'edge',
          width: 1080,
          height: 1080,
          maintainAspectRatio: false,
        },
        ppi: 72,
        colorSpace: 'srgb',
        bitDepth: 8,
        outputSharpening: 'medium',
        background: 'white',
        filenameTemplate: '{name}-instagram-{index}',
      },
    ],
  },
  {
    id: 'stories',
    name: 'Instagram Stories',
    description: '1080x1920, JPEG 85%',
    icon: 'Smartphone',
    configs: [
      {
        id: 'stories-1',
        name: 'Instagram Stories',
        format: 'jpeg',
        quality: 85,
        resize: {
          mode: 'edge',
          width: 1080,
          height: 1920,
          maintainAspectRatio: false,
        },
        ppi: 72,
        colorSpace: 'srgb',
        bitDepth: 8,
        outputSharpening: 'medium',
        background: 'white',
        filenameTemplate: '{name}-story-{index}',
      },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: '2560x1440, JPEG 95%',
    icon: 'Briefcase',
    configs: [
      {
        id: 'portfolio-1',
        name: 'Portfolio HD',
        format: 'jpeg',
        quality: 95,
        resize: {
          mode: 'edge',
          width: 2560,
          height: 1440,
          maintainAspectRatio: true,
        },
        ppi: 72,
        colorSpace: 'srgb',
        bitDepth: 8,
        outputSharpening: 'low',
        background: 'transparent',
        filenameTemplate: '{name}-portfolio-{index}',
      },
    ],
  },
  {
    id: 'print',
    name: 'Print',
    description: '300 PPI, TIFF/JPEG 100%',
    icon: 'Printer',
    configs: [
      {
        id: 'print-1',
        name: 'Print Quality',
        format: 'tiff',
        quality: 100,
        resize: {
          mode: 'none',
          maintainAspectRatio: true,
        },
        ppi: 300,
        colorSpace: 'adobe-rgb',
        bitDepth: 16,
        outputSharpening: 'high',
        background: 'white',
        filenameTemplate: '{name}-print-{index}',
      },
    ],
  },
];

/**
 * Creates a default export config
 */
export function createDefaultExportConfig(): ExportConfig {
  return {
    id: Date.now().toString(),
    name: 'Custom Export',
    format: 'jpeg',
    quality: 90,
    resize: {
      mode: 'none',
      maintainAspectRatio: true,
    },
    ppi: 72,
    colorSpace: 'srgb',
    bitDepth: 8,
    outputSharpening: 'none',
    background: 'transparent',
    filenameTemplate: '{name}-{date}-{time}',
  };
}
