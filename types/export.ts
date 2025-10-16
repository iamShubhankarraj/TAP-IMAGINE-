// types/export.ts

export type ExportFormat = 'jpeg' | 'png' | 'tiff' | 'heif' | 'avif' | 'webp' | 'psd' | 'psb' | 'dng';

export type ResizeMode = 'edge' | 'percentage' | 'megapixel' | 'none';

export type ColorSpace = 'srgb' | 'adobe-rgb' | 'display-p3' | 'prophoto-rgb';

export type BitDepth = 8 | 16 | 32;

export type OutputSharpening = 'none' | 'low' | 'medium' | 'high';

export type BackgroundType = 'transparent' | 'white' | 'black' | 'custom';

export interface ResizeConfig {
  mode: ResizeMode;
  width?: number;
  height?: number;
  percentage?: number;
  megapixels?: number;
  maintainAspectRatio: boolean;
}

export interface ExportConfig {
  id: string;
  name: string;
  format: ExportFormat;
  quality: number; // 0-100
  resize: ResizeConfig;
  ppi: number;
  colorSpace: ColorSpace;
  bitDepth: BitDepth;
  outputSharpening: OutputSharpening;
  background: BackgroundType;
  customBackgroundColor?: string;
  filenameTemplate: string;
}

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  configs: ExportConfig[];
}

export interface ExportJob {
  id: string;
  config: ExportConfig;
  imageUrl: string;
  adjustments: ImageAdjustments;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: Blob;
  filename?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  rotation: number;
  filter: string | null;
}

export interface ExportQueue {
  jobs: ExportJob[];
  isProcessing: boolean;
}

export interface FilenameTokens {
  name: string;
  date: string;
  time: string;
  format: string;
  width: string;
  height: string;
  preset: string;
  index: string;
}
