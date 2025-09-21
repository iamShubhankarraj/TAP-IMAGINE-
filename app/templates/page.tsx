// app/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  Search, Filter, Sparkles, ImageIcon, Loader2, 
  ArrowRight, Grid3X3, RefreshCw, Check
} from 'lucide-react';

// Types for templates
type Template = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  prompt_template: string;
};

// Template categories
const CATEGORIES = [
  'All',
  'Portrait',
  'Style',
  'Artistic',
  'Character',
  'Scene',
  'Abstract'
];

export default function TemplatesPage() {
  const router = useRouter();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('is_public', true)
          .order('name');
        
        if (error) throw error;
        
        setTemplates(data || []);
        setFilteredTemplates(data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Filter templates when search or category changes
  useEffect(() => {
    if (templates.length === 0) return;
    
    let filtered = [...templates];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => 
        template.category === selectedCategory
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) || 
        (template.description && template.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedCategory]);

  const handleUseTemplate = (templateId: string) => {
    router.push(`/editor?template=${templateId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Templates</h1>
            <p className="text-white/70">
              Explore our collection of creative templates for your images
            </p>
          </div>
          
          <Link
            href="/editor"
            className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors flex items-center gap-2"
          >
            Create Custom
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full p-3 pl-10 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-banana"
                />
                <Search className="h-5 w-5 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-white/10">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full flex items-center gap-1 transition-colors
                    ${selectedCategory === category 
                      ? 'bg-banana/20 text-banana border border-banana/30' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                >
                  {selectedCategory === category && <Check className="h-4 w-4" />}
                  {category}
                </button>
              ))}
              
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors border border-transparent"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-banana" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Grid3X3 className="h-16 w-16 text-white/30 mb-4" />
            <p className="text-white/80 text-lg mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-6 py-3 bg-white/10 text-white rounded-lg flex items-center gap-2 hover:bg-white/15 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-16 w-16 text-white/30 mb-4" />
            <p className="text-white/80 text-lg mb-2">No templates found</p>
            <p className="text-white/60 mb-4">Try a different search or category</p>
            <button 
              onClick={handleClearFilters}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-banana/50 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <ImageIcon className="h-12 w-12 text-white/20" />
                    </div>
                  )}
                  
                  {template.category && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-xs text-white/80">
                      {template.category}
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleUseTemplate(template.id)}
                      className="px-6 py-3 bg-banana text-gray-900 font-medium rounded-lg hover:bg-banana-light transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Use Template
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-white/70 text-sm line-clamp-2">{template.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Random Template Button */}
        {filteredTemplates.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * filteredTemplates.length);
                handleUseTemplate(filteredTemplates[randomIndex].id);
              }}
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/15 transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-banana" />
              Surprise Me!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}