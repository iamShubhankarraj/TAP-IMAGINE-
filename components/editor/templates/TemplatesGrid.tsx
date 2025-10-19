// components/editor/templates/TemplatesGrid.tsx
'use client';

import React, { useState } from 'react';
import { TemplateData, TemplateCategory } from '@/types/templates';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/constants/templates';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';
import SurpriseMeButton from './SurpriseMeButton';

interface TemplatesGridProps {
  onTemplateSelect: (template: TemplateData) => void;
  userImage?: string;
}

export default function TemplatesGrid({ onTemplateSelect, userImage }: TemplatesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleSurpriseMe = () => {
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    setPreviewTemplate(randomTemplate);
    setSelectedTemplateId(randomTemplate.id);
  };

  const handleTemplateClick = (template: TemplateData) => {
    setPreviewTemplate(template);
    setSelectedTemplateId(template.id);
  };

  const handleApply = () => {
    if (previewTemplate) {
      onTemplateSelect(previewTemplate);
      setPreviewTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Surprise Me Button */}
      <SurpriseMeButton 
        onClick={handleSurpriseMe}
        disabled={!userImage}
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${selectedCategory === cat.id
                ? 'bg-banana text-gray-900'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
              }
            `}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => handleTemplateClick(template)}
            isSelected={selectedTemplateId === template.id}
          />
        ))}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          previewImage={userImage}
          onApply={handleApply}
          onClose={() => {
            setPreviewTemplate(null);
            setSelectedTemplateId(null);
          }}
        />
      )}
    </div>
  );
}