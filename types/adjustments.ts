// types/adjustments.ts

export interface ImageAdjustments {
    // Core/Global
    exposure: number;
    contrast: number;
    highlights: number;
    shadows: number;
    whites: number;
    blacks: number;
    brightness: number;
    saturation: number;
    vibrance: number;
    temperature: number;
    tint: number;
    
    // Detail
    texture: number;
    clarity: number;
    dehaze: number;
    sharpness: number;
    noiseReduction: number;
    grain: number;
    
    // HSL (Hue, Saturation, Luminance)
    hsl: HSLAdjustments;
    
    // Color Grading
    colorGrading: ColorGrading;
    
    // Optics
    vignette: number;
    vignetteRoundness: number;
    
    // Transform
    rotation: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    
    // Creative
    filter: string | null;
  }
  
  export interface HSLAdjustments {
    red: { hue: number; saturation: number; luminance: number };
    orange: { hue: number; saturation: number; luminance: number };
    yellow: { hue: number; saturation: number; luminance: number };
    green: { hue: number; saturation: number; luminance: number };
    aqua: { hue: number; saturation: number; luminance: number };
    blue: { hue: number; saturation: number; luminance: number };
    purple: { hue: number; saturation: number; luminance: number };
    magenta: { hue: number; saturation: number; luminance: number };
  }
  
  export interface ColorGrading {
    shadows: { hue: number; saturation: number };
    midtones: { hue: number; saturation: number };
    highlights: { hue: number; saturation: number };
    balance: number;
  }
  
  export interface Preset {
    id: string;
    name: string;
    description: string;
    category: 'cinema' | 'lifestyle' | 'product' | 'portrait' | 'landscape' | 'artistic' | 'vintage';
    adjustments: Partial<ImageAdjustments>;
    thumbnailUrl?: string;
  }
  
  export const defaultAdjustments: ImageAdjustments = {
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    brightness: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    texture: 0,
    clarity: 0,
    dehaze: 0,
    sharpness: 0,
    noiseReduction: 0,
    grain: 0,
    hsl: {
      red: { hue: 0, saturation: 0, luminance: 0 },
      orange: { hue: 0, saturation: 0, luminance: 0 },
      yellow: { hue: 0, saturation: 0, luminance: 0 },
      green: { hue: 0, saturation: 0, luminance: 0 },
      aqua: { hue: 0, saturation: 0, luminance: 0 },
      blue: { hue: 0, saturation: 0, luminance: 0 },
      purple: { hue: 0, saturation: 0, luminance: 0 },
      magenta: { hue: 0, saturation: 0, luminance: 0 },
    },
    colorGrading: {
      shadows: { hue: 0, saturation: 0 },
      midtones: { hue: 0, saturation: 0 },
      highlights: { hue: 0, saturation: 0 },
      balance: 0,
    },
    vignette: 0,
    vignetteRoundness: 0,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    filter: null,
  };