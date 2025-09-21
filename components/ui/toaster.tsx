// components/ui/toaster.tsx
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToasterContextType = {
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToasterContext = createContext<ToasterContextType | null>(null);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ toast, dismiss }}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToasterContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider');
  }
  return context;
};

export function Toaster({ 
  toasts, 
  dismiss 
}: { 
  toasts: Toast[]; 
  dismiss: (id: string) => void; 
}) {
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 max-w-md w-full">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`p-4 rounded-lg backdrop-blur-md border shadow-lg flex gap-4 transform transition-all duration-300 animate-slide-up ${
            getToastStyles(toast.type)
          }`}
        >
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          
          <button 
            onClick={() => dismiss(toast.id)}
            className="text-white/70 hover:text-white h-5 w-5 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-900/80 border-green-600 text-white';
    case 'error':
      return 'bg-red-900/80 border-red-600 text-white';
    case 'warning':
      return 'bg-yellow-900/80 border-yellow-600 text-white';
    case 'info':
      return 'bg-blue-900/80 border-blue-600 text-white';
    default:
      return 'bg-gray-900/80 border-gray-600 text-white';
  }
}