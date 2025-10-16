// components/landing/HeroSection.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Wand2, Layers } from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { trackCTA } from '@/lib/analytics';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function HeroSection() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div 
          ref={titleRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col items-center text-center transition-all duration-1000 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge 
            variant="primary" 
            icon={<Sparkles className="h-4 w-4" />}
            size="lg"
            className="mb-6"
            animated
          >
            AI-Powered Image Editor
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white max-w-5xl">
            Transform Your Images with{' '}
            <span className="text-banana bg-clip-text text-transparent bg-gradient-to-r from-banana to-yellow-300">
              AI Magic
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mb-10">
            TAP[IMAGINE] combines the power of AI with professional editing tools to help you create stunning, unique images with just a few clicks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href="/editor" onClick={() => trackCTA('Start Creating', 'hero')}>
              <Button 
                variant="primary" 
                size="lg" 
                animated
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Start Creating
              </Button>
            </Link>
            <Link href="/templates" onClick={() => trackCTA('Explore Templates', 'hero')}>
              <Button variant="secondary" size="lg" animated>
                Explore Templates
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-gray-900"
                  />
                ))}
              </div>
              <span>50K+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-banana"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>
        
        {/* Hero Image */}
        <div 
          ref={imageRef as React.RefObject<HTMLDivElement>}
          className={`mt-16 max-w-6xl mx-auto relative transition-all duration-1000 delay-300 ${
            imageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900/50 backdrop-blur-sm">
            <div className="aspect-video relative">
              {/* Placeholder for demo - replace with actual screenshot */}
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-banana mx-auto mb-4" />
                  <p className="text-white/70">Editor Preview</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating elements for decoration */}
          <div className="absolute -top-8 -left-8 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl hidden md:block animate-bounce">
            <Wand2 className="h-6 w-6 text-banana" />
          </div>
          <div className="absolute -bottom-6 -right-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl hidden md:block animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Layers className="h-6 w-6 text-banana" />
          </div>
        </div>
      </div>
    </section>
  );
}
