
import React from 'react';

interface AlertProps {
  message: string;
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-4" role="alert">
      <div className="py-1">
        <svg className="fill-current h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm1-4a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1z"/></svg>
      </div>
      <div>
        <p className="font-bold text-red-300">Error</p>
        <p className="text-sm text-red-200">{message}</p>
      </div>
       <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-500/30 transition-colors">
        <svg className="fill-current h-5 w-5 text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
};