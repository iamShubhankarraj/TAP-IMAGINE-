// components/landing/TestimonialsSection.tsx
'use client';

import { Star, Quote } from 'lucide-react';
import Card from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Digital Artist',
    avatar: '🎨',
    rating: 5,
    text: 'TAP[IMAGINE] has completely transformed my workflow. The AI understands exactly what I want, and the results are always stunning.',
    highlight: 'completely transformed my workflow',
  },
  {
    name: 'Marcus Johnson',
    role: 'Social Media Manager',
    avatar: '📱',
    rating: 5,
    text: 'Creating content for multiple platforms used to take hours. Now I can generate and customize images in minutes. Game changer!',
    highlight: 'Game changer',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Photographer',
    avatar: '📸',
    rating: 5,
    text: 'The professional tools combined with AI capabilities give me creative freedom I never had before. Absolutely love it!',
    highlight: 'creative freedom I never had before',
  },
  {
    name: 'David Park',
    role: 'Marketing Director',
    avatar: '💼',
    rating: 5,
    text: 'Our team productivity has skyrocketed. The ability to quickly iterate on designs has been invaluable for our campaigns.',
    highlight: 'team productivity has skyrocketed',
  },
  {
    name: 'Lisa Thompson',
    role: 'Content Creator',
    avatar: '✨',
    rating: 5,
    text: 'I was skeptical at first, but the quality of the AI-generated images exceeded my expectations. This tool is a must-have!',
    highlight: 'exceeded my expectations',
  },
  {
    name: 'Alex Kumar',
    role: 'UI Designer',
    avatar: '🎯',
    rating: 5,
    text: 'The template library is incredible, and the customization options are endless. Perfect for both quick edits and detailed work.',
    highlight: 'Perfect for both quick edits and detailed work',
  },
];

export default function TestimonialsSection() {
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
            Loved by Creators Worldwide
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Join thousands of satisfied users who are creating amazing content with TAP[IMAGINE].
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Trust Indicators */}
        <TrustIndicators />
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card variant="glass" hoverable animated padding="lg" className="h-full relative">
        <Quote className="absolute top-6 right-6 h-8 w-8 text-banana/20" />
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
            {testimonial.avatar}
          </div>
          <div>
            <h4 className="text-white font-semibold">{testimonial.name}</h4>
            <p className="text-white/60 text-sm">{testimonial.role}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-banana fill-banana" />
          ))}
        </div>

        <p className="text-white/80 leading-relaxed">
          {testimonial.text}
        </p>
      </Card>
    </div>
  );
}

function TrustIndicators() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-banana mb-2">500K+</div>
        <p className="text-white/70">Images Created</p>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-banana mb-2">50K+</div>
        <p className="text-white/70">Active Users</p>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-banana mb-2">4.9/5</div>
        <p className="text-white/70">User Rating</p>
      </div>
      <div className="text-center">
        <div className="text-3xl md:text-4xl font-bold text-banana mb-2">99.9%</div>
        <p className="text-white/70">Uptime</p>
      </div>
    </div>
  );
}
