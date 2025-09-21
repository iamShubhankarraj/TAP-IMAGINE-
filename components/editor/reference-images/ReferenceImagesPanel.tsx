// components/editor/reference-images/ReferenceImagesPanel.tsx
'use client';

import { useState } from 'react';
import { useImageStore } from '@/context/image-store';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { 
  Images, Upload, X, Eye, EyeOff, 
  Trash2, Info, Plus, ArrowRight 
} from 'lucide-react';

type ReferenceImagesPanelProps = {
  onClose?: () => void;
  disabled?: boolean;
};

export default function ReferenceImagesPanel({ 
  onClose,
  disabled = false 
}: ReferenceImagesPanelProps) {
  const { 
    referenceImages, 
    addReferenceImage, 
    removeReferenceImage, 
    clearReferenceImages 
  } = useImageStore();
  
  const [isUploading, setIsUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<string | null>(null);
  
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      setIsUploading(true);
      
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const base64 = reader.result as string;
          addReferenceImage({
            id: uuidv4(),
            url: base64,
            name: file.name,
            createdAt: new Date(),
          });
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      });
    },
    disabled: disabled
  });

  const handleRemoveImage = (id: string) => {
    removeReferenceImage(id);
    if (isPreviewOpen === id) {
      setIsPreviewOpen(null);
    }
  };

  const toggleImagePreview = (id: string) => {
    setIsPreviewOpen(isPreviewOpen === id ? null : id);
  };

  return (
    <div className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-5 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Images className="h-5 w-5 text-banana" />
          Reference Images
        </h3>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {showInfo && (
        <div className="bg-white/5 rounded-lg p-3 flex gap-3">
          <Info className="h-5 w-5 text-banana flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white/80 text-sm">
              Reference images help guide the AI in understanding your desired style or content. 
              Add images that represent the look you want to achieve.
            </p>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-banana text-xs mt-1 hover:underline"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
          ${disabled ? 'border-white/20 opacity-50 cursor-not-allowed' : 'border-white/30 hover:border-white/50'}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="py-6">
            <div className="w-8 h-8 border-2 border-t-banana border-white/20 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/70">Uploading images...</p>
          </div>
        ) : (
          <div className="py-6">
            <Upload className="h-8 w-8 mx-auto text-white/40 mb-3" />
            <p className="text-white/70 mb-1">
              Drag & drop reference images here
            </p>
            <p className="text-white/50 text-sm mb-3">
              PNG, JPG, WEBP up to 10MB
            </p>
            <button 
              type="button"
              onClick={open}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-lg text-white/80 hover:text-white transition-colors 
                mx-auto inline-flex items-center gap-2
                ${disabled 
                  ? 'bg-white/5 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/15'}
              `}
            >
              <Plus size={18} />
              Add Images
            </button>
          </div>
        )}
      </div>
      
      {referenceImages.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white/80 text-sm font-medium">
              {referenceImages.length} Reference {referenceImages.length === 1 ? 'Image' : 'Images'}
            </h4>
            
            <button
              onClick={clearReferenceImages}
              disabled={disabled}
              className="text-red-400 text-xs hover:text-red-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
          
          <div className="space-y-3">
            {referenceImages.map((img) => (
              <div 
                key={img.id} 
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                <div className="flex items-center p-2 gap-3">
                  <div className="h-12 w-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={img.url} 
                      alt={img.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{img.name}</p>
                    <p className="text-white/50 text-xs">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleImagePreview(img.id)}
                      disabled={disabled}
                      className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isPreviewOpen === img.id ? "Hide preview" : "Show preview"}
                    >
                      {isPreviewOpen === img.id ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      disabled={disabled}
                      className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                {isPreviewOpen === img.id && (
                  <div className="p-2 pt-0">
                    <img 
                      src={img.url} 
                      alt={img.name}
                      className="w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}