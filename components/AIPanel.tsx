import React from 'react';
import { SparklesIcon } from './Icons';
import { Spinner } from './Spinner';
import { Templates } from './Templates';

interface AIPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isImageUploaded: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({ prompt, setPrompt, onGenerate, isLoading, isImageUploaded }) => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-xl font-bold text-gray-100 tracking-wider">AI Magic</h2>
      
      <div className="flex-grow flex flex-col space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
            Editing Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Add a birthday hat' or 'Change the background to a sunny beach'"
            className="w-full bg-[#0D0D0F] border border-white/20 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition resize-none shadow-inner"
            rows={4}
            disabled={isLoading || !isImageUploaded}
          />
        </div>

        <Templates onSelectTemplate={setPrompt} disabled={isLoading || !isImageUploaded} />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !prompt.trim() || !isImageUploaded}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-400 disabled:bg-sky-500/30 disabled:cursor-not-allowed disabled:text-sky-300/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1C] focus:ring-sky-400 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-400/30"
      >
        {isLoading ? (
          <>
            <Spinner />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5"/>
            Generate
          </>
        )}
      </button>
    </div>
  );
};