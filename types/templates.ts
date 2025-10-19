// types/templates.ts

export interface TemplateData {
    id: string;
    name: string;
    description: string;
    prompt: string;
    category: TemplateCategory;
    thumbnail: string;
    tags: string[];
    isPremium?: boolean;
  }
  
  export type TemplateCategory = 
    | 'portrait'
    | 'style' 
    | 'artistic'
    | 'fun'
    | 'fantasy'
    | 'historical'
    | 'effects'
    | 'all';
  
  export interface TemplateGridProps {
    templates: TemplateData[];
    onSelect: (template: TemplateData) => void;
    selectedId?: string;
    category?: TemplateCategory;
  }
  