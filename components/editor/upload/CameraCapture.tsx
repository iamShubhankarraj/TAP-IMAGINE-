// components/editor/upload/CameraCapture.tsx
'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw, Download } from 'lucide-react';
import { StoredImage } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';

interface CameraCaptureProps {
  onCapture: (image: StoredImage) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    setCapturedImage(dataUrl);
    stopCamera();
  }, [stopCamera]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  const handleSave = useCallback(() => {
    if (!capturedImage) return;

    onCapture({
      id: uuidv4(),
      url: capturedImage,
      name: `camera-${Date.now()}.jpg`,
      createdAt: new Date(),
    });
    
    onClose();
  }, [capturedImage, onCapture, onClose]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-banana" />
            Camera Capture
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center text-white/70">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-banana text-gray-900 rounded-lg hover:bg-banana-light transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 bg-black/50 backdrop-blur-md flex items-center justify-center gap-4">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retake
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-banana hover:bg-banana-light text-gray-900 font-medium rounded-full transition-colors flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={switchCamera}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                disabled={!isStreaming}
              >
                <RotateCcw className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={capturePhoto}
                className="p-6 rounded-full bg-banana hover:bg-banana-light transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isStreaming}
              >
                <Camera className="h-8 w-8 text-gray-900" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}