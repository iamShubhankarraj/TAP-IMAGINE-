// components/landing/FeaturesSection.tsx
'use client';

import { Wand2, Image as ImageIcon, Palette, Zap, Users, Download } from 'lucide-react';
import Card from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Transformations',
    description: 'Simply describe what you want with natural language, and watch as AI brings your vision to life.',
    features: ['Text-based prompts', 'Multiple reference images', 'Style transfer', 'Creative effects'],
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: ImageIcon,
    title: 'Creative Templates',
    description: 'Get inspired with our collection of templates for quick and stunning transformations.',
    features: ['20+ preset styles', 'One-click application', 'Vintage to futuristic', 'Artistic to realistic'],
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Palette,
    title: 'Professional Tools',
    description: 'Fine-tune your creations with precision using our professional-grade editing tools.',
    features: ['Image adjustments', 'Filters & effects', 'Aspect ratio control', 'High-quality export'],
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience instant results with our optimized AI pipeline and real-time preview.',
    features: ['Real-time preview', 'Quick generation', 'Optimized performance', 'Batch processing'],
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'Share your creations, get feedback, and collaborate with other creators.',
    features: ['Share gallery', 'Team workspaces', 'Comments & feedback', 'Version history'],
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    icon: Download,
    title: 'Export Options',
    description: 'Download your images in multiple formats with custom quality settings.',
    features: ['Multiple formats', 'Custom dimensions', 'Quality presets', 'Watermark options'],
    gradient: 'from-red-500/20 to-pink-500/20',
  },
];

export default function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section className="py-20 md:py-32 px-4 relative">
      <div className="container mx-auto">
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Powerful Features, Simple Interface
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to transform your images, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
  const Icon = feature.icon;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card variant="glass" hoverable animated padding="lg" className="h-full group">
        <div className={`rounded-full bg-gradient-to-br ${feature.gradient} w-14 h-14 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-7 w-7 text-banana" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-banana transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-white/70 mb-6">
          {feature.description}
        </p>
        <ul className="space-y-2">
          {feature.features.map((item, i) => (
            <li key={i} className="flex items-center text-white/60 text-sm group-hover:text-white/80 transition-colors duration-300">
              <div className="h-1.5 w-1.5 rounded-full bg-banana mr-2 group-hover:scale-150 transition-transform duration-300"></div>
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
