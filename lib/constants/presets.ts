// lib/constants/presets.ts
import { Preset } from '@/types/adjustments';
import presetsConfig from '@/config/presets.json';

type PresetCategory = Preset['category'];

export const PRESETS: Preset[] = presetsConfig.presets.map((p) => ({
  ...p,
  category: p.category as PresetCategory,
}));

export const getPresetsByCategory = (category: string) => {
  return PRESETS.filter(p => p.category === category);
};

export const PRESET_CATEGORIES = [
  { id: 'cinema', label: 'Cinema', icon: '🎬' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '📸' },
  { id: 'portrait', label: 'Portrait', icon: '👤' },
  { id: 'landscape', label: 'Landscape', icon: '🌄' },
  { id: 'product', label: 'Product', icon: '📦' },
  { id: 'artistic', label: 'Artistic', icon: '🎨' },
  { id: 'vintage', label: 'Vintage', icon: '📷' },
];