// components/landing/HowItWorksSection.tsx
'use client';

import { Upload, Sparkles, Download, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload Your Image',
    description: 'Upload the image you want to transform. Add reference images if you have a specific style in mind.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Describe or Select',
    description: 'Type what you want or choose from our templates. The AI understands your vision and creative intent.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: 3,
    icon: Download,
    title: 'Download & Share',
    description: 'Fine-tune the results with our tools, then download or share your creation with the world.',
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function HowItWorksSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <section className="py-20 md:py-32 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Transform your images in three simple steps. No technical skills required.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
            
            {/* Connecting arrows for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-banana/50" />
            </div>
            <div className="hidden md:block absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
              <ArrowRight className="h-8 w-8 text-banana/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const Icon = step.icon;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`relative transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <Card variant="glass" hoverable animated padding="lg" className="text-center h-full">
        {/* Step number badge */}
        <div className="mb-6 mx-auto relative">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto relative z-10`}>
            {step.number}
          </div>
          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-50 animate-pulse`}></div>
        </div>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-banana" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3">
          {step.title}
        </h3>
        <p className="text-white/70 leading-relaxed">
          {step.description}
        </p>
      </Card>
    </div>
  );
}
