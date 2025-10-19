// components/shared/Alert.tsx
import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose: () => void;
}

export default function Alert({ type = 'error', message, onClose }: AlertProps) {
  const styles = {
    error: 'bg-red-500/10 border-red-500/50 text-red-200',
    success: 'bg-green-500/10 border-green-500/50 text-green-200',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-200',
  };

  const icons = {
    error: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 mb-4 flex items-start gap-3 animate-in slide-in-from-top duration-300`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}