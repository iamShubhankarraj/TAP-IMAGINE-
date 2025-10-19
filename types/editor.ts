// types/editor.ts

export interface StoredImage {
    id: string;
    url: string; // base64 or URL
    name: string;
    size?: number;
    createdAt: Date;
  }
  
  export interface EditorState {
    primaryImage: StoredImage | null;
    referenceImages: StoredImage[];
    generatedImage: StoredImage | null;
    currentPrompt: string;
    selectedTemplate: Template | null;
    isProcessing: boolean;
    error: string | null;
  }
  
  export interface Template {
    id: string;
    name: string;
    description: string;
    promptTemplate: string;
    category: 'portrait' | 'style' | 'artistic' | 'fun' | 'fantasy' | 'historical' | 'effects';
    thumbnailUrl: string;
    previewUrl?: string;
    isActive: boolean;
    usageCount?: number;
  }
  
  export interface CameraConfig {
    facingMode: 'user' | 'environment';
    width: number;
    height: number;
    aspectRatio: number;
  }
  
  export type EditorTab = 'upload' | 'prompt' | 'templates' | 'adjust' | 'export';
  export type AspectRatioOption = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | 'original';