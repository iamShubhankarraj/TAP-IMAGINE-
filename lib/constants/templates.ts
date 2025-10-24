// lib/constants/templates.ts
import { TemplateData, TemplateCategory } from '@/types/templates';
import templatesConfig from '@/config/templates.json';

// Export templates using the TemplateData shape expected by UI components
export const TEMPLATES: TemplateData[] = templatesConfig.templates as TemplateData[];

export const getTemplatesByCategory = (category: TemplateCategory): TemplateData[] => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string): TemplateData | undefined => {
  return TEMPLATES.find(t => t.id === id);
};

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Templates', icon: '🎨' },
  { id: 'portrait', label: 'Portrait', icon: '👤' },
  { id: 'style', label: 'Style', icon: '✨' },
  { id: 'artistic', label: 'Artistic', icon: '🖼️' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
  { id: 'fantasy', label: 'Fantasy', icon: '🔮' },
  { id: 'historical', label: 'Historical', icon: '🏛️' },
  { id: 'effects', label: 'Effects', icon: '⚡' },
];