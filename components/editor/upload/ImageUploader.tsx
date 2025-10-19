// components/editor/upload/ImageUploader.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { StoredImage } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import CameraCapture from './CameraCapture';

interface ImageUploaderProps {
  onImageUpload: (image: StoredImage) => void;
  title?: string;
  multiple?: boolean;
}

export default function ImageUploader({ 
  onImageUpload, 
  title = "Upload Image",
  multiple = false 
}: ImageUploaderProps) {
  const [showCamera, setShowCamera] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageUpload({
          id: uuidv4(),
          url: base64,
          name: file.name,
          size: file.size,
          createdAt: new Date(),
        });
      };
      
      reader.readAsDataURL(file);
    });
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-banana bg-banana/10 scale-105' 
              : 'border-white/30 hover:border-banana/50 hover:bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-white/5">
              {isDragActive ? (
                <Upload className="h-10 w-10 text-banana animate-bounce" />
              ) : (
                <ImageIcon className="h-10 w-10 text-white/50" />
              )}
            </div>
            
            <div>
              <p className="text-white/70 font-medium mb-1">
                {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-white/50 text-sm">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Camera Button */}
        <button
          onClick={() => setShowCamera(true)}
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5" />
          Use Camera
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={(image) => {
            onImageUpload(image);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}