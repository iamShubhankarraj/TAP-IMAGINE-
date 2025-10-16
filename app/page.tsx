// app/page.tsx
'use client';

import { useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ShowcaseSection from '@/components/landing/ShowcaseSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import { trackPageView } from '@/lib/analytics';

export default function HomePage() {
  useEffect(() => {
    trackPageView('/');
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
