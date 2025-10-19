// components/animations/FunnyLoading.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getRandomLoadingMessage } from '@/lib/ai/gemini-config';

interface FunnyLoadingProps {
  message?: string;
}

export default function FunnyLoading({ message }: FunnyLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(message || getRandomLoadingMessage());

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage(getRandomLoadingMessage());
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [message]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-purple-900/90 to-violet-900/90 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl max-w-md mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-banana/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="h-16 w-16 animate-spin text-banana relative z-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-3">
            Creating Magic ✨
          </h3>
          
          <p className="text-white/80 text-lg leading-relaxed animate-in fade-in duration-500">
            {currentMessage}
          </p>
          
          <div className="mt-6 flex gap-2">
            <div className="h-2 w-2 rounded-full bg-banana/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-banana/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-banana/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}