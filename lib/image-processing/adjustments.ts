// lib/image-processing/adjustments.ts
import { ImageAdjustments } from '@/types/adjustments';

export function applyAdjustmentsToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  adjustments: ImageAdjustments
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = image.width;
  canvas.height = image.height;

  // Apply transformations
  ctx.save();
  
  // Handle rotation
  if (adjustments.rotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((adjustments.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // Handle flips
  if (adjustments.flipHorizontal || adjustments.flipVertical) {
    const scaleX = adjustments.flipHorizontal ? -1 : 1;
    const scaleY = adjustments.flipVertical ? -1 : 1;
    const translateX = adjustments.flipHorizontal ? canvas.width : 0;
    const translateY = adjustments.flipVertical ? canvas.height : 0;
    
    ctx.translate(translateX, translateY);
    ctx.scale(scaleX, scaleY);
  }

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Apply CSS-like filters
  const filterString = buildFilterString(adjustments);
  if (filterString) {
    ctx.filter = filterString;
    ctx.drawImage(canvas, 0, 0);
  }

  ctx.restore();
}

function buildFilterString(adj: ImageAdjustments): string {
  const filters: string[] = [];

  // Brightness (0-200, default 100)
  const brightness = 100 + adj.brightness;
  if (brightness !== 100) {
    filters.push(`brightness(${brightness}%)`);
  }

  // Contrast (0-200, default 100)
  const contrast = 100 + adj.contrast;
  if (contrast !== 100) {
    filters.push(`contrast(${contrast}%)`);
  }

  // Saturation (0-200, default 100)
  const saturation = 100 + adj.saturation;
  if (saturation !== 100) {
    filters.push(`saturate(${saturation}%)`);
  }

  // Exposure (simulated with brightness)
  const exposure = 100 + adj.exposure * 2;
  if (adj.exposure !== 0) {
    filters.push(`brightness(${exposure}%)`);
  }

  // Temperature (hue rotation)
  if (adj.temperature !== 0) {
    filters.push(`hue-rotate(${adj.temperature * 2}deg)`);
  }

  // Sharpness (not directly supported, but can use contrast)
  if (adj.sharpness > 0) {
    const sharpnessContrast = 100 + adj.sharpness * 0.5;
    filters.push(`contrast(${sharpnessContrast}%)`);
  }

  return filters.join(' ');
}

export function generateCSSFilter(adjustments: ImageAdjustments, filter?: string): string {
  let cssFilter = buildFilterString(adjustments);
  
  if (filter && filter !== 'none') {
    const filterObj = FILTERS.find(f => f.id === filter);
    if (filterObj) {
      cssFilter = cssFilter ? `${cssFilter} ${filterObj.cssFilter}` : filterObj.cssFilter;
    }
  }

  return cssFilter;
}

// Import filters
import { FILTERS } from '@/lib/constants/filters';