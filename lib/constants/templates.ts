// lib/constants/templates.ts
import { Template } from '@/types/editor';
import templatesConfig from '@/config/templates.json';

export const TEMPLATES: Template[] = templatesConfig.templates.map(t => ({
  ...t,
  promptTemplate: t.prompt,
  thumbnailUrl: t.thumbnail,
  isActive: true,
}));

export const getTemplatesByCategory = (category: string) => {
  if (category === 'all') return TEMPLATES;
  return TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id);
};

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '🎨' },
  { id: 'portrait', label: 'Portrait', icon: '👤' },
  { id: 'style', label: 'Style', icon: '✨' },
  { id: 'artistic', label: 'Artistic', icon: '🖼️' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
  { id: 'fantasy', label: 'Fantasy', icon: '🔮' },
  { id: 'historical', label: 'Historical', icon: '🏛️' },
  { id: 'effects', label: 'Effects', icon: '⚡' },
];