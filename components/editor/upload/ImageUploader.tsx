// components/editor/upload/ImageUploader.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { useImageStore } from '@/context/image-store';
import { Upload, X, Camera, ImagePlus, Trash2 } from 'lucide-react';

type ImageUploaderProps = {
  type: 'primary' | 'reference';
  maxFiles?: number;
  onUploadComplete?: () => void;
};

export default function ImageUploader({ 
  type, 
  maxFiles = 5,
  onUploadComplete
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const { 
    primaryImage, 
    referenceImages,
    setPrimaryImage, 
    addReferenceImage, 
    removeReferenceImage, 
    clearReferenceImages
  } = useImageStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      setIsUploading(true);
      
      // For primary image, just use the first file
      const filesToProcess = type === 'primary' 
        ? [acceptedFiles[0]] 
        : acceptedFiles.slice(0, maxFiles);

      filesToProcess.forEach((file) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const base64 = reader.result as string;
          const newImage = {
            id: uuidv4(),
            url: base64,
            name: file.name,
            createdAt: new Date(),
          };

          if (type === 'primary') {
            setPrimaryImage(newImage);
          } else {
            addReferenceImage(newImage);
          }
          
          setIsUploading(false);
          onUploadComplete?.();
        };
        
        reader.readAsDataURL(file);
      });
    },
    [type, maxFiles, setPrimaryImage, addReferenceImage, onUploadComplete]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: type === 'primary' ? 1 : maxFiles,
    multiple: type !== 'primary',
    noClick: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const handleRemoveImage = (id: string) => {
    if (type === 'primary') {
      setPrimaryImage(null);
    } else {
      removeReferenceImage(id);
    }
  };

  const captureFromCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.click();
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onDrop([file]);
      }
    };
  };

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${isDragActive 
            ? 'border-banana bg-white/10' 
            : 'border-white/30 hover:border-white/50'}`
        }
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-t-banana border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Uploading {type === 'primary' ? 'image' : 'images'}...</p>
          </div>
        ) : (
          <div className="text-center py-6">
            <Upload className="h-12 w-12 mx-auto text-white/40 mb-4" />
            <p className="text-white/70 mb-2">
              {type === 'primary' 
                ? 'Drag & drop your main image here' 
                : 'Add reference images to guide the AI'
              }
            </p>
            <p className="text-white/50 text-sm mb-4">
              PNG, JPG, WEBP up to 10MB
            </p>
            <button 
              type="button"
              onClick={open}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors mx-auto inline-flex items-center gap-2"
            >
              <ImagePlus size={18} />
              Browse Files
            </button>
          </div>
        )}
      </div>

      {/* Preview area for primary image */}
      {type === 'primary' && primaryImage && (
        <div className="mt-4 relative group">
          <img 
            src={primaryImage.url} 
            alt="Primary"
            className="w-full h-auto max-h-64 object-contain rounded-lg border border-white/10"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={() => handleRemoveImage(primaryImage.id)}
              className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Preview area for reference images */}
      {type === 'reference' && referenceImages.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/70 text-sm">{referenceImages.length} reference {referenceImages.length === 1 ? 'image' : 'images'}</p>
            {referenceImages.length > 1 && (
              <button
                onClick={clearReferenceImages}
                className="text-red-400 text-sm hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {referenceImages.map((img) => (
              <div key={img.id} className="relative group">
                <img 
                  src={img.url} 
                  alt={img.name}
                  className="w-full h-24 object-cover rounded-lg border border-white/10"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="p-1.5 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera capture button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={captureFromCamera}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors inline-flex items-center gap-2"
        >
          <Camera size={18} />
          Use Camera
        </button>
      </div>
    </div>
  );
}