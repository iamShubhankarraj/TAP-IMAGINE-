// components/landing/ShowcaseSection.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/button';
import { trackCTA } from '@/lib/analytics';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const showcaseItems = [
  {
    title: 'Vintage Film',
    description: 'Warm, nostalgic tones',
    gradient: 'from-amber-500/80 to-orange-600/80',
  },
  {
    title: 'Cyberpunk',
    description: 'Neon lights & futuristic',
    gradient: 'from-purple-500/80 to-pink-600/80',
  },
  {
    title: 'Watercolor',
    description: 'Artistic & dreamy',
    gradient: 'from-blue-400/80 to-cyan-500/80',
  },
  {
    title: 'Dark Moody',
    description: 'Dramatic & cinematic',
    gradient: 'from-gray-700/80 to-gray-900/80',
  },
  {
    title: 'Pop Art',
    description: 'Bold & vibrant colors',
    gradient: 'from-red-500/80 to-yellow-500/80',
  },
  {
    title: 'Minimalist',
    description: 'Clean & modern',
    gradient: 'from-slate-400/80 to-slate-600/80',
  },
];

export default function ShowcaseSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section className="py-20 md:py-32 px-4 relative bg-black/20">
      <div className="container mx-auto">
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            See What's Possible
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            From subtle enhancements to complete transformations, the possibilities are endless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseItems.map((item, index) => (
            <ShowcaseCard key={index} item={item} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/editor" 
            onClick={() => trackCTA('Create Your Own', 'showcase')}
          >
            <Button 
              variant="secondary" 
              size="lg" 
              animated
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ item, index }: { item: typeof showcaseItems[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative group cursor-pointer transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
        {/* Gradient background as placeholder */}
        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-transform duration-500 group-hover:scale-110`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        {/* Icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-12 w-12 text-white animate-pulse" />
        </div>

        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="px-6 py-3 bg-banana text-gray-900 rounded-full font-medium transform scale-90 group-hover:scale-100 transition-transform duration-300"
            onClick={() => trackCTA(`Try ${item.title} Style`, 'showcase_card')}
          >
            Try This Style
          </button>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h4 className="text-white font-semibold text-lg mb-1">
            {item.title}
          </h4>
          <p className="text-white/70 text-sm">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}
