// components/editor/templates/TemplatesGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type Template = {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  prompt_template: string;
  category: string;
};

type TemplatesGridProps = {
  onSelectTemplate: (templateName: string, promptTemplate: string) => void;
  isLoading?: boolean;
};

export default function TemplatesGrid({ 
  onSelectTemplate, 
  isLoading = false 
}: TemplatesGridProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates from Supabase
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('is_public', true)
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setTemplates(data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fallback templates for development/error cases
  const fallbackTemplates: Template[] = [
    { id: '1', name: 'You as a child', description: 'Transform into a younger version of yourself', thumbnail_url: '', prompt_template: 'Transform this person to look like a child version of themselves', category: 'Portrait' },
    { id: '2', name: '80s Retro', description: 'Vintage 80s aesthetic with film grain', thumbnail_url: '', prompt_template: 'Transform this image with a vibrant 80s retro aesthetic', category: 'Style' },
    { id: '3', name: 'Cyberpunk', description: 'Futuristic neon cityscape with digital elements', thumbnail_url: '', prompt_template: 'Add cyberpunk elements to this image with neon lights', category: 'Style' },
    { id: '4', name: 'Watercolor', description: 'Artistic watercolor painting effect', thumbnail_url: '', prompt_template: 'Convert this image into a watercolor painting with soft edges', category: 'Artistic' },
    { id: '5', name: 'Anime Style', description: 'Japanese anime illustration style', thumbnail_url: '', prompt_template: 'Transform this image into anime style with bold lines', category: 'Artistic' },
    { id: '6', name: 'Superhero', description: 'Comic book superhero transformation', thumbnail_url: '', prompt_template: 'Transform this person into a superhero with a dynamic pose', category: 'Character' },
  ];

  const displayTemplates = templates.length > 0 ? templates : fallbackTemplates;

  const handleSelectTemplate = (id: string, name: string, promptTemplate: string) => {
    setSelectedTemplate(id);
    onSelectTemplate(name, promptTemplate);
  };

  const handleSurpriseMe = () => {
    // Select a random template
    const randomIndex = Math.floor(Math.random() * displayTemplates.length);
    const template = displayTemplates[randomIndex];
    setSelectedTemplate(template.id);
    onSelectTemplate(template.name, template.prompt_template);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {isLoadingTemplates ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-white/10"></div>
              <div className="p-3">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id, template.name, template.prompt_template)}
                disabled={isLoading}
                className={`
                  relative rounded-lg overflow-hidden text-left transition-all
                  ${selectedTemplate === template.id ? 'ring-2 ring-banana' : 'hover:scale-[1.02]'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="aspect-square bg-white/5 relative">
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <span className="text-white/70">{template.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-sm">
                  <h3 className="text-sm font-medium text-white truncate">{template.name}</h3>
                  <p className="text-xs text-white/60 truncate">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2">
                    <Star className="h-5 w-5 text-banana fill-banana" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5 text-banana" />
              Surprise Me!
            </button>
          </div>
        </>
      )}
    </div>
  );
}