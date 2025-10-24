'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Check, ChevronLeft, ChevronRight,
  Wand2, Palette, Grid3X3, Download, Users, MessageSquare,
  Layers, Sparkles, SlidersHorizontal, Filter, Crop, RotateCw,
  Lock, FolderOpen, Eraser, Scissors, Brush, Paintbrush,
  Cloud, Share2, Code, ExternalLink, Star
} from 'lucide-react';
import featuresConfig from './features-config.json';
import carouselData from './carousel-data.json';

// Icon mapping
const iconMap: Record<string, any> = {
  Wand2, Palette, Grid3X3, Download, Users, MessageSquare,
  Layers, Sparkles, SlidersHorizontal, Filter, Crop, RotateCw,
  Lock, FolderOpen, Eraser, Scissors, Brush, Paintbrush,
  Cloud, Share2, Code
};

// Types
type Feature = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  status: 'current' | 'coming-soon';
  category: string;
  icon: string;
  deepLink: string;
  highlights: string[];
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type Comparison = {
  id: string;
  title: string;
  description: string;
  category: string;
  beforeLabel: string;
  afterLabel: string;
  prompt: string;
};

export default function FeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const categories: Category[] = featuresConfig.categories as Category[];
  const rawFeatures = featuresConfig.features as Array<Omit<Feature, 'status'> & { status: string }>;
  const features: Feature[] = rawFeatures.map((f) => ({
    ...f,
    status: f.status === 'current' || f.status === 'coming-soon' ? f.status : 'coming-soon',
  }));
  const comparisons: Comparison[] = carouselData.comparisons as Comparison[];

  // Filter features
  const filteredFeatures = features.filter(feature => {
    const categoryMatch = selectedCategory === 'all' || feature.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || feature.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // Group features by category
  const featuresByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = filteredFeatures.filter(f => f.category === cat.id);
    return acc;
  }, {} as Record<string, Feature[]>);

  // Carousel auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % comparisons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, comparisons.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % comparisons.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + comparisons.length) % comparisons.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredFeatures]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
              <Star className="h-4 w-4 text-banana" />
              <span className="text-white/90 text-sm font-medium">Powerful Features for Creative Minds</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Everything You Need to Create <span className="text-banana">Stunning Images</span>
            </h1>
            <p className="text-xl text-white/80 mb-10">
              Discover the full suite of AI-powered tools and professional features that make TAP[IMAGINE] the ultimate creative platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/editor" 
                className="px-8 py-4 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] inline-flex items-center justify-center gap-2"
              >
                Try Features Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href="#roadmap" 
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                View Roadmap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Carousel */}
      <section className="py-20 px-4 relative bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See the Transformation
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Real examples of what you can create with TAP[IMAGINE]
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
              {/* Carousel Content */}
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0">
                  {comparisons.map((comparison, index) => (
                    <div
                      key={comparison.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="h-full flex flex-col md:flex-row">
                        {/* Before */}
                        <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center p-8">
                            <div className="text-white/40 mb-2 text-sm font-medium">{comparison.beforeLabel}</div>
                            <div className="h-48 flex items-center justify-center">
                              <div className="text-white/20 text-lg">Original Image</div>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
                            Before
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px md:w-1 bg-banana/50 relative flex items-center justify-center">
                          <div className="absolute w-8 h-8 bg-banana rounded-full flex items-center justify-center">
                            <ArrowRight className="h-4 w-4 text-gray-900" />
                          </div>
                        </div>

                        {/* After */}
                        <div className="flex-1 relative bg-gradient-to-br from-purple-900 to-violet-800 flex items-center justify-center">
                          <div className="text-center p-8">
                            <div className="text-white/80 mb-2 text-sm font-medium">{comparison.afterLabel}</div>
                            <div className="h-48 flex items-center justify-center">
                              <Sparkles className="h-16 w-16 text-banana" />
                            </div>
                          </div>
                          <div className="absolute top-4 right-4 px-3 py-1 bg-banana/20 backdrop-blur-sm rounded-full text-banana text-xs font-medium">
                            After
                          </div>
                        </div>
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <h3 className="text-white font-semibold text-lg mb-1">{comparison.title}</h3>
                        <p className="text-white/70 text-sm mb-2">{comparison.description}</p>
                        <p className="text-white/50 text-xs italic">"{comparison.prompt}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {comparisons.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-banana w-8' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 px-4 relative bg-black/10 sticky top-16 z-40 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Features
              </button>
              <button
                onClick={() => setSelectedStatus('current')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === 'current'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Check className="h-4 w-4" />
                Available Now
              </button>
              <button
                onClick={() => setSelectedStatus('coming-soon')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedStatus === 'coming-soon'
                    ? 'bg-banana text-gray-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Star className="h-4 w-4" />
                Coming Soon
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {getIcon(cat.icon)}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid by Category */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          {selectedCategory === 'all' ? (
            // Show by category
            categories.map((category) => {
              const categoryFeatures = featuresByCategory[category.id];
              if (categoryFeatures.length === 0) return null;

              return (
                <div key={category.id} className="mb-20 last:mb-0 animate-on-scroll opacity-0">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-banana/20 rounded-xl">
                        {getIcon(category.icon) && (
                          <div className="text-banana">
                            {getIcon(category.icon)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                          {category.name}
                        </h2>
                        <p className="text-white/70">{category.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryFeatures.map((feature, index) => (
                      <FeatureCard key={feature.id} feature={feature} index={index} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show filtered features
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature, index) => (
                <FeatureCard key={feature.id} feature={feature} index={index} />
              ))}
            </div>
          )}

          {filteredFeatures.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">No features found matching your filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4 relative bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Product Roadmap
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Exciting features coming soon to TAP[IMAGINE]
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {features
              .filter(f => f.status === 'coming-soon')
              .map((feature, index) => (
                <div
                  key={feature.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all animate-on-scroll opacity-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        {getIcon(feature.icon) && (
                          <div className="text-purple-400">
                            {getIcon(feature.icon)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full whitespace-nowrap">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-white/70 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {feature.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                            <Check className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-900 to-purple-800 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-banana/20 rounded-full filter blur-xl opacity-60"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full filter blur-xl opacity-60"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Start Creating Today
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Experience the full power of TAP[IMAGINE] with all current features available now.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/editor" 
                  className="px-8 py-4 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors shadow-lg inline-flex items-center justify-center gap-2"
                >
                  Launch Editor
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  href="/templates" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Browse Templates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  const isCurrent = feature.status === 'current';

  return (
    <div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-banana/50 transition-all group animate-on-scroll opacity-0"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${isCurrent ? 'bg-banana/20' : 'bg-purple-500/20'}`}>
          {getIcon(feature.icon) && (
            <div className={isCurrent ? 'text-banana' : 'text-purple-400'}>
              {getIcon(feature.icon)}
            </div>
          )}
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isCurrent 
            ? 'bg-green-500/20 text-green-300' 
            : 'bg-purple-500/20 text-purple-300'
        }`}>
          {isCurrent ? 'Available' : 'Coming Soon'}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-banana transition-colors">
        {feature.name}
      </h3>
      <p className="text-white/70 text-sm mb-4">{feature.shortDescription}</p>

      <ul className="space-y-2 mb-6">
        {feature.highlights.slice(0, 3).map((highlight, i) => (
          <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
            <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isCurrent ? 'text-banana' : 'text-purple-400'}`} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Link
          href={feature.deepLink}
          className="inline-flex items-center gap-2 text-banana hover:text-banana-light text-sm font-medium transition-colors"
        >
          Try it now
          <ExternalLink className="h-4 w-4" />
        </Link>
      ) : (
        <a
          href={feature.deepLink}
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          Learn more
          <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
