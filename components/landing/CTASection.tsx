// components/landing/CTASection.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Button from '@/components/ui/button';
import { trackCTA } from '@/lib/analytics';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section className="py-20 md:py-32 px-4 relative">
      <div className="container mx-auto">
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className={`max-w-5xl mx-auto relative transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900"></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-banana/20 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-banana text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="h-4 w-4" />
                <span>Join 50,000+ Creators</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Ready to Transform Your Images?
              </h2>
              
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                Join thousands of creators who are bringing their creative visions to life with TAP[IMAGINE].
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link 
                  href="/auth/signup" 
                  onClick={() => trackCTA('Get Started Free', 'bottom_cta')}
                >
                  <Button 
                    variant="primary" 
                    size="xl" 
                    animated
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link 
                  href="/templates" 
                  onClick={() => trackCTA('Explore Templates', 'bottom_cta')}
                >
                  <Button variant="secondary" size="xl" animated>
                    Explore Templates
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-banana fill-banana" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-banana fill-banana" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-banana fill-banana" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
