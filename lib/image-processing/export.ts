// lib/image-processing/export.ts
import { ImageAdjustments } from '@/types/adjustments';
import { applyAdjustmentsToCanvas } from './adjustments';

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0-1
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export async function exportImage(
  imageUrl: string,
  adjustments: ImageAdjustments,
  options: ExportOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        
        // Calculate dimensions
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          options.width,
          options.height,
          options.aspectRatio
        );

        canvas.width = width;
        canvas.height = height;

        // Apply adjustments
        applyAdjustmentsToCanvas(canvas, img, adjustments);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${options.format}`,
          options.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function calculateDimensions(
  origWidth: number,
  origHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  aspectRatio?: string
): { width: number; height: number } {
  let width = origWidth;
  let height = origHeight;

  // Apply target dimensions
  if (targetWidth) width = targetWidth;
  if (targetHeight) height = targetHeight;

  // Apply aspect ratio
  if (aspectRatio && aspectRatio !== 'original') {
    const [w, h] = aspectRatio.split(':').map(Number);
    const ratio = w / h;
    
    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
}