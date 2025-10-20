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

  // HSL Per-Color Adjustments (approximated with global filters)
  // Note: True per-color HSL requires canvas pixel manipulation
  // We'll apply combined effects from all colors
  const hslHueTotal = Object.values(adj.hsl).reduce((sum, color) => sum + color.hue, 0) / 8;
  const hslSatTotal = Object.values(adj.hsl).reduce((sum, color) => sum + color.saturation, 0) / 8;
  const hslLumTotal = Object.values(adj.hsl).reduce((sum, color) => sum + color.luminance, 0) / 8;

  // Apply HSL combined effects
  if (hslHueTotal !== 0) {
    filters.push(`hue-rotate(${hslHueTotal * 0.6}deg)`);
  }
  if (hslSatTotal !== 0) {
    const satValue = 100 + (hslSatTotal * 0.8);
    filters.push(`saturate(${satValue}%)`);
  }
  if (hslLumTotal !== 0) {
    const lumValue = 100 + (hslLumTotal * 0.5);
    filters.push(`brightness(${lumValue}%)`);
  }

  // Color Grading (shadows, midtones, highlights)
  const gradingHue = (
    adj.colorGrading.shadows.hue + 
    adj.colorGrading.midtones.hue + 
    adj.colorGrading.highlights.hue
  ) / 3;
  const gradingSat = (
    adj.colorGrading.shadows.saturation + 
    adj.colorGrading.midtones.saturation + 
    adj.colorGrading.highlights.saturation
  ) / 3;

  if (gradingHue !== 0) {
    filters.push(`hue-rotate(${gradingHue * 0.5}deg)`);
  }
  if (gradingSat !== 0) {
    const gradingSatValue = 100 + (gradingSat * 0.6);
    filters.push(`saturate(${gradingSatValue}%)`);
  }

  // Color Balance
  if (adj.colorGrading.balance !== 0) {
    const balanceHue = adj.colorGrading.balance * 0.7;
    filters.push(`hue-rotate(${balanceHue}deg)`);
  }

  // Exposure (-100 to 100, affects overall brightness exponentially)
  if (adj.exposure !== 0) {
    const exposureValue = 100 + (adj.exposure * 1.5);
    filters.push(`brightness(${exposureValue}%)`);
  }

  // Brightness (-100 to 100, linear brightness adjustment)
  if (adj.brightness !== 0) {
    const brightnessValue = 100 + adj.brightness;
    filters.push(`brightness(${brightnessValue}%)`);  }

  // Contrast (-100 to 100)
  if (adj.contrast !== 0) {
    const contrastValue = 100 + adj.contrast;
    filters.push(`contrast(${contrastValue}%)`);  }

  // Saturation (-100 to 100)
  if (adj.saturation !== 0) {
    const saturationValue = 100 + adj.saturation;
    filters.push(`saturate(${saturationValue}%)`);  }

  // Vibrance (simulated with selective saturation boost)
  // Vibrance affects low-saturation areas more than high-saturation areas
  if (adj.vibrance !== 0) {
    const vibranceValue = 100 + (adj.vibrance * 0.7);
    filters.push(`saturate(${vibranceValue}%)`);  }

  // Temperature (color temperature shift using hue-rotate and sepia)
  if (adj.temperature !== 0) {
    // Positive = warmer (yellow/orange), Negative = cooler (blue)
    const tempHue = adj.temperature * 1.5;
    if (adj.temperature > 0) {
      // Warm: add sepia tone
      const sepiaAmount = Math.min(adj.temperature / 2, 30);
      filters.push(`sepia(${sepiaAmount}%)`);
    }
    filters.push(`hue-rotate(${tempHue}deg)`);  }

  // Tint (green/magenta shift)
  if (adj.tint !== 0) {
    // Tint is tricky in CSS, we approximate with hue-rotate
    const tintHue = adj.tint * 0.8;
    filters.push(`hue-rotate(${tintHue}deg)`);  }

  // Highlights (simulated, affects bright areas)
  // Note: CSS filters don't have true highlight/shadow control
  // We approximate by adjusting brightness with a bias
  if (adj.highlights !== 0) {
    const highlightsValue = 100 + (adj.highlights * 0.3);
    filters.push(`brightness(${highlightsValue}%)`);  }

  // Shadows (affects dark areas)
  if (adj.shadows !== 0) {
    // Positive shadows = lift shadows (brighten), Negative = crush shadows (darken)
    const shadowValue = 100 + (adj.shadows * 0.4);
    filters.push(`brightness(${shadowValue}%)`);  }

  // Whites (pure white point adjustment)
  if (adj.whites !== 0) {
    const whitesValue = 100 + (adj.whites * 0.5);
    filters.push(`brightness(${whitesValue}%)`);  }

  // Blacks (pure black point adjustment)
  if (adj.blacks !== 0) {
    const blacksValue = 100 + (adj.blacks * 0.5);
    filters.push(`contrast(${blacksValue}%)`);  }

  // Clarity (mid-tone contrast)
  if (adj.clarity !== 0) {
    const clarityValue = 100 + (adj.clarity * 0.8);
    filters.push(`contrast(${clarityValue}%)`);  }

  // Texture (fine detail enhancement)
  if (adj.texture !== 0) {
    const textureValue = 100 + (adj.texture * 0.3);
    filters.push(`contrast(${textureValue}%)`);  }

  // Dehaze (removes atmospheric haze)
  if (adj.dehaze !== 0) {
    const dehazeContrast = 100 + (adj.dehaze * 0.6);
    const dehazeSat = 100 + (adj.dehaze * 0.4);
    filters.push(`contrast(${dehazeContrast}%)`);
    filters.push(`saturate(${dehazeSat}%)`);
  }

  // Sharpness
  if (adj.sharpness !== 0) {
    const sharpnessContrast = 100 + (adj.sharpness * 0.4);
    filters.push(`contrast(${sharpnessContrast}%)`);  }

  // Grain (simulated with opacity - limited in CSS)
  // Note: True grain effect requires canvas manipulation
  if (adj.grain > 0) {
    const grainValue = 100 - (adj.grain * 0.1);
    filters.push(`opacity(${grainValue}%)`);  }

  // Vignette effect (requires backdrop effects, limited in pure CSS)
  // This is better handled in the component with overlays

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