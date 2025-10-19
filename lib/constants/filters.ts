// lib/constants/filters.ts

export interface Filter {
    id: string;
    name: string;
    cssFilter: string;
  }
  
  export const FILTERS: Filter[] = [
    { id: 'none', name: 'None', cssFilter: '' },
    { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.5) contrast(0.9) brightness(1.1)' },
    { id: 'bw', name: 'B&W', cssFilter: 'grayscale(1) contrast(1.1)' },
    { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(1)' },
    { id: 'cool', name: 'Cool', cssFilter: 'saturate(1.2) hue-rotate(-20deg) brightness(1.05)' },
    { id: 'warm', name: 'Warm', cssFilter: 'saturate(1.3) hue-rotate(20deg) brightness(1.05)' },
    { id: 'film', name: 'Film', cssFilter: 'contrast(1.1) saturate(0.8) brightness(1.05)' },
    { id: 'dramatic', name: 'Dramatic', cssFilter: 'contrast(1.3) saturate(1.2) brightness(0.95)' },
    { id: 'fade', name: 'Fade', cssFilter: 'contrast(0.85) saturate(0.7) brightness(1.1)' },
    { id: 'noir', name: 'Noir', cssFilter: 'grayscale(1) contrast(1.4) brightness(0.9)' },
    { id: 'dreamy', name: 'Dreamy', cssFilter: 'saturate(0.7) brightness(1.15) contrast(0.8) blur(0.5px)' },
    { id: 'vibrant', name: 'Vibrant', cssFilter: 'saturate(1.5) contrast(1.15) brightness(1.05)' },
  ];