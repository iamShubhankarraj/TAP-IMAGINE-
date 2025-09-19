export interface UploadedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

export interface EditedContent {
  imageData: string;
  text: string | null;
}

export interface ClientAdjustments {
  brightness: number;
  contrast: number;
  saturate: number;
  rotation: number;
  filter: string;
}