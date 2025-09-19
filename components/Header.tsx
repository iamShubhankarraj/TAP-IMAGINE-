
import React from 'react';
import { CameraIcon } from './Icons';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <CameraIcon className="w-8 h-8 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-50">
              AI Photo <span className="text-sky-400">Studio</span>
            </h1>
          </div>
           <button 
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0D0F] focus:ring-sky-500"
            >
              New Project
            </button>
        </div>
      </div>
    </header>
  );
};