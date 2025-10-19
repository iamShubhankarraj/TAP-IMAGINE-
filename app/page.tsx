// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, Wand2, Image as ImageIcon, 
  Zap, Palette, Star, Play, CheckCircle2, Brain, Rocket, Shield,
  Layers, TrendingUp, Lock, Users, BarChart3, ChevronDown
} from 'lucide-react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    Object.values(observerRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Premium Animated Background with Enhanced Parallax */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient - Darker and More Sophisticated */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0f0a1f]" />
        
        {/* Multiple Layered Gradient Orbs with Advanced Parallax */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-transparent rounded-full blur-[150px] animate-float"
          style={{ 
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03 - scrollY * 0.08}px)`,
            transition: 'transform 0.25s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[1200px] h-[1200px] bg-gradient-to-tr from-blue-600/30 via-cyan-500/20 to-transparent rounded-full blur-[150px] animate-float-delayed"
          style={{ 
            transform: `translate(${-mousePosition.x * 0.025}px, ${-mousePosition.y * 0.025 + scrollY * 0.12}px)`,
            transition: 'transform 0.25s ease-out'
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-gradient-to-r from-pink-500/25 to-yellow-500/20 rounded-full blur-[130px] animate-pulse-slow"
          style={{ 
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-bl from-violet-500/20 to-indigo-500/15 rounded-full blur-[120px]"
          style={{ 
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
            transition: 'transform 0.35s ease-out',
            animation: 'float 10s ease-in-out infinite 1s'
          }}
        />
        
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.015)_1.5px,transparent_1.5px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black_40%,transparent)]" />
        
        {/* Noise Texture for Premium Feel */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
        </div>
        
        {/* Radial Gradient Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,15,0.4)_100%)]" />
      </div>

      {/* Premium Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Floating Badge with Enhanced Glassmorphism */}
          <div 
            ref={(el) => { observerRefs.current['badge'] = el; }}
            id="badge"
            className={`flex justify-center mb-12 transition-all duration-1000 ${
              isVisible['badge'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition duration-500 animate-gradient-x" />
              
              {/* Badge */}
              <div className="relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-banana rounded-full blur-md opacity-75 animate-pulse-slow" />
                  <Sparkles className="relative h-5 w-5 text-banana" />
                </div>
                <span className="text-sm font-bold text-white/90 tracking-wide">Powered by Gemini Nano Banana AI</span>
                <ArrowRight className="h-4 w-4 text-white/60 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Hero Title with Premium Typography */}
          <div 
            ref={(el) => { observerRefs.current['hero-title'] = el; }}
            id="hero-title"
            className={`text-center space-y-10 mb-16 transition-all duration-1000 delay-150 ${
              isVisible['hero-title'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h1 className="text-7xl md:text-9xl font-black leading-[0.95] tracking-tight">
              <span className="block text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.15)]">
                Transform Images
              </span>
              <span className="block mt-4 text-transparent bg-clip-text bg-gradient-to-r from-banana via-yellow-300 to-orange-400 animate-gradient-x drop-shadow-[0_0_60px_rgba(255,230,109,0.3)]">
                With AI Magic
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/70 max-w-4xl mx-auto leading-relaxed font-semibold">
              Experience the <span className="text-white/90 font-black">future of image editing</span>. Create stunning visuals in seconds with our cutting-edge AI technology.
            </p>
          </div>

          {/* Premium CTA Buttons */}
          <div 
            ref={(el) => { observerRefs.current['cta-buttons'] = el; }}
            id="cta-buttons"
            className={`flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 transition-all duration-1000 delay-300 ${
              isVisible['cta-buttons'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link href="/auth/signup" className="group relative">
              {/* Animated Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500 animate-gradient-x" />
              
              {/* Button */}
              <div className="relative px-12 py-6 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 text-gray-900 font-black text-xl rounded-2xl shadow-2xl transform group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300">
                <span className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Start Creating Free
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </div>
            </Link>
            
            <Link href="#demo" className="group relative">
              {/* Glassmorphic Button */}
              <div className="relative px-12 py-6 bg-white/5 backdrop-blur-2xl text-white font-bold text-xl rounded-2xl border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 transform hover:scale-105 shadow-xl">
                <span className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity" />
                    <Play className="relative h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  Watch Demo
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Feature Pills */}
          <div 
            ref={(el) => { observerRefs.current['feature-pills'] = el; }}
            id="feature-pills"
            className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-1000 delay-500 ${
              isVisible['feature-pills'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {[
              { icon: CheckCircle2, text: 'No Credit Card' },
              { icon: Users, text: '10,000+ Happy Users' },
              { icon: Sparkles, text: 'AI-Powered' },
              { icon: Zap, text: 'Instant Results' },
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Subtle Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300" />
                
                {/* Pill */}
                <div className="relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 shadow-lg">
                  <feature.icon className="h-4 w-4 text-banana" />
                  <span className="font-semibold text-sm">{feature.text}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-white/40">
              <span className="text-xs font-semibold uppercase tracking-wider">Scroll to explore</span>
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Premium Bento Grid Features */}
      <section className="relative z-10 px-4 py-40">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Glassmorphism */}
          <div 
            ref={(el) => { observerRefs.current['features-header'] = el; }}
            id="features-header"
            className={`text-center mb-24 transition-all duration-1000 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-block mb-6">
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10">
                <Star className="h-4 w-4 text-banana" />
                <span className="text-sm font-bold text-white/80 tracking-wide uppercase">Premium Features</span>
              </div>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
              Professional-grade tools powered by <span className="text-white/90 font-bold">cutting-edge AI</span>
            </p>
          </div>

          {/* Advanced Bento Grid */}
          <div 
            ref={(el) => { observerRefs.current['bento-grid'] = el; }}
            id="bento-grid"
            className={`grid grid-cols-1 md:grid-cols-6 gap-6 transition-all duration-1000 delay-200 ${
              isVisible['bento-grid'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Large Feature Card 1 - AI Intelligence */}
            <div className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-3xl">
              {/* Animated Border Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500 animate-gradient-x" />
              
              {/* Card Content */}
              <div className="relative h-full p-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl">
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl" />
                
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className="relative inline-flex w-fit mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                      <Brain className="h-12 w-12 text-purple-400" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-4xl font-black text-white mb-6 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                    AI-Powered Intelligence
                  </h3>
                  <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
                    Harness the power of <span className="text-white/90 font-bold">Google's Gemini Nano Banana</span> to transform images with natural language prompts. Simply describe what you want, and watch the magic happen.
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mt-auto">
                    {['Natural Language', 'Style Transfer', 'Smart Editing', 'Auto-Enhance'].map((tag, i) => (
                      <span 
                        key={i}
                        className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-semibold hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Small Feature Card 1 - Lightning Fast */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-50 transition duration-500" />
              <div className="relative h-full p-8 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="relative inline-flex w-fit mb-6">
                    <div className="absolute inset-0 bg-cyan-500/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Zap className="relative h-14 w-14 text-cyan-400 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Lightning Fast</h3>
                  <p className="text-white/70 text-base leading-relaxed">Process images in seconds, not minutes</p>
                </div>
              </div>
            </div>

            {/* Small Feature Card 2 - 100% Secure */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-50 transition duration-500" />
              <div className="relative h-full p-8 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="relative inline-flex w-fit mb-6">
                    <div className="absolute inset-0 bg-green-500/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Shield className="relative h-14 w-14 text-green-400 group-hover:scale-110 transition-all" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">100% Secure</h3>
                  <p className="text-white/70 text-base leading-relaxed">Your images are private and encrypted</p>
                </div>
              </div>
            </div>

            {/* Medium Feature Card 1 - Templates */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-3xl">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-50 transition duration-500" />
              <div className="relative h-full p-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="relative inline-flex w-fit mb-6">
                    <div className="absolute inset-0 bg-orange-500/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon className="relative h-16 w-16 text-orange-400 group-hover:scale-110 group-hover:-rotate-6 transition-all" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">20+ Templates</h3>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    From vintage to futuristic, artistic to photorealistic
                  </p>
                  <div className="mt-auto">
                    <button className="group/btn relative overflow-hidden px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-semibold transition-all hover:scale-105">
                      <span className="relative z-10 flex items-center gap-2">
                        Browse Templates
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Feature Card 2 - Professional Tools */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-3xl">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-50 transition duration-500" />
              <div className="relative h-full p-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="relative inline-flex w-fit mb-6">
                    <div className="absolute inset-0 bg-yellow-500/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Palette className="relative h-16 w-16 text-yellow-400 group-hover:scale-110 group-hover:rotate-6 transition-all" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">Professional Tools</h3>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Fine-tune every detail with precision controls
                  </p>
                  <div className="mt-auto">
                    <button className="group/btn relative overflow-hidden px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white font-semibold transition-all hover:scale-105">
                      <span className="relative z-10 flex items-center gap-2">
                        Explore Tools
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Social Proof Section */}
      <section className="relative z-10 px-4 py-32">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          {/* Section Title */}
          <div 
            ref={(el) => { observerRefs.current['stats-header'] = el; }}
            id="stats-header"
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible['stats-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-banana/10 to-yellow-500/10 backdrop-blur-xl border border-banana/20 mb-6">
              <TrendingUp className="h-4 w-4 text-banana" />
              <span className="text-sm font-bold text-white/80 tracking-wide uppercase">Trusted By Thousands</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Numbers That Speak
            </h2>
          </div>
          
          <div 
            ref={(el) => { observerRefs.current['stats-grid'] = el; }}
            id="stats-grid"
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-200 ${
              isVisible['stats-grid'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {[
              { value: '500K+', label: 'Images Created', icon: ImageIcon, gradient: 'from-purple-600 to-pink-600' },
              { value: '10K+', label: 'Happy Users', icon: Users, gradient: 'from-blue-600 to-cyan-600' },
              { value: '99.9%', label: 'Satisfaction Rate', icon: Star, gradient: 'from-yellow-600 to-orange-600' },
            ].map((stat, i) => (
              <div 
                key={i}
                className="group relative"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${stat.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-50 transition duration-500`} />
                
                {/* Card */}
                <div className="relative h-full p-12 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 rounded-3xl text-center hover:border-white/40 transition-all duration-500 hover:scale-105">
                  {/* Icon */}
                  <div className="relative inline-flex mb-8">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} bg-opacity-20 border border-white/10`}>
                      <stat.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Value */}
                  <div className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 tracking-tight">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-xl text-white/70 font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultimate Premium CTA Section */}
      <section className="relative z-10 px-4 py-40">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={(el) => { observerRefs.current['final-cta'] = el; }}
            id="final-cta"
            className={`group relative transition-all duration-1000 ${
              isVisible['final-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Mega Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-gradient-x" />
            
            {/* CTA Card */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 p-20">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-gradient-x" />
              
              {/* Floating Orbs Inside Card */}
              <div className="absolute top-10 right-20 w-40 h-40 bg-gradient-to-br from-banana/30 to-yellow-500/30 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
              
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="inline-flex mb-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-banana to-yellow-400 rounded-3xl blur-2xl opacity-75 animate-pulse-slow" />
                    <div className="relative flex items-center justify-center w-28 h-28 bg-gradient-to-br from-banana to-yellow-400 rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Rocket className="h-14 w-14 text-gray-900" />
                    </div>
                  </div>
                </div>
                
                {/* Title */}
                <h2 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
                  Ready to Create
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-banana via-yellow-300 to-orange-400 animate-gradient-x">
                    Magic?
                  </span>
                </h2>
                
                {/* Description */}
                <p className="text-2xl md:text-3xl text-white/70 mb-14 max-w-3xl mx-auto font-medium leading-relaxed">
                  Join thousands of creators transforming their images with <span className="text-white/90 font-bold">AI-powered precision</span>
                </p>
                
                {/* CTA Button */}
                <div className="inline-flex flex-col items-center gap-8">
                  <Link href="/auth/signup" className="group/cta relative">
                    {/* Button Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover/cta:opacity-100 transition duration-500 animate-gradient-x" />
                    
                    {/* Button */}
                    <div className="relative inline-flex items-center gap-4 px-14 py-7 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 text-gray-900 font-black text-2xl rounded-2xl shadow-2xl transform group-hover/cta:scale-110 group-hover/cta:-translate-y-2 transition-all duration-500">
                      <Sparkles className="h-7 w-7 group-hover/cta:rotate-180 transition-transform duration-500" />
                      Get Started Free
                      <ArrowRight className="h-7 w-7 group-hover/cta:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                  
                  {/* Subtext */}
                  <div className="flex items-center gap-6 text-white/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium">No credit card required</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">100% secure</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">Start in seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 px-4 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-banana rounded-xl blur-md opacity-75" />
                  <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-banana to-yellow-400 rounded-xl">
                    <Sparkles className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
                <span className="text-2xl font-black text-white">TAP[IMAGINE]</span>
              </div>
              <p className="text-white/60 text-base max-w-md leading-relaxed mb-6">
                Transform your images with the power of AI. Create stunning visuals in seconds with our cutting-edge technology.
              </p>
              <div className="flex items-center gap-4">
                {['Twitter', 'GitHub', 'Discord'].map((social) => (
                  <button 
                    key={social}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <span className="text-white/60 text-xs font-bold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Templates', 'API'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2025 TAP[IMAGINE]. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <Link key={item} href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
