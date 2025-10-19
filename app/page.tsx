// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, Wand2, Image as ImageIcon, 
  Zap, Palette, Star, Play, CheckCircle2, Brain, Rocket, Shield
} from 'lucide-react';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Parallax */}
      <div className="fixed inset-0 z-0">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900" />
        
        {/* Animated Gradient Orbs with Parallax */}
        <div 
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-[120px] animate-float"
          style={{ 
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02 - scrollY * 0.1}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-full blur-[120px] animate-float-delayed"
          style={{ 
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01 + scrollY * 0.15}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-[100px] animate-pulse-slow"
          style={{ 
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
              <Sparkles className="h-4 w-4 text-banana animate-pulse" />
              <span className="text-sm font-semibold text-white/90">Powered by Gemini Nano Banana AI</span>
              <ArrowRight className="h-4 w-4 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-8 mb-12">
            <h1 className="text-6xl md:text-8xl font-black leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="block text-white drop-shadow-2xl">Transform Images</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-banana via-yellow-300 to-orange-400 animate-gradient-x drop-shadow-2xl">
                With AI Magic
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Experience the future of image editing. Create stunning visuals in seconds with our cutting-edge AI technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/auth/signup"
              className="group relative px-10 py-5 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 text-gray-900 font-black text-lg rounded-2xl hover:shadow-[0_20px_80px_rgba(255,230,109,0.5)] transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-3">
                Start Creating Free
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Link>
            
            <Link 
              href="#demo"
              className="group px-10 py-5 bg-white/5 backdrop-blur-2xl text-white font-bold text-lg rounded-2xl border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </span>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {['No Credit Card', '10,000+ Happy Users', 'AI-Powered', 'Instant Results'].map((feature, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 hover:bg-white/10 hover:scale-105 transition-all duration-300"
              >
                <CheckCircle2 className="h-4 w-4 text-banana" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative z-10 px-4 py-32">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Professional-grade tools powered by cutting-edge AI
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Large Feature 1 */}
            <div className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12 hover:border-white/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">AI-Powered Intelligence</h3>
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  Harness the power of Google's Gemini Nano Banana to transform images with natural language prompts. Simply describe what you want, and watch the magic happen.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Natural Language', 'Style Transfer', 'Smart Editing'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small Feature 1 */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 hover:border-white/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <Zap className="h-12 w-12 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black text-white mb-3">Lightning Fast</h3>
                <p className="text-white/70">Process images in seconds, not minutes</p>
              </div>
            </div>

            {/* Small Feature 2 */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 hover:border-white/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <Shield className="h-12 w-12 text-green-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black text-white mb-3">100% Secure</h3>
                <p className="text-white/70">Your images are private and encrypted</p>
              </div>
            </div>

            {/* Medium Feature */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-10 hover:border-white/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <ImageIcon className="h-14 w-14 text-orange-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-white mb-4">20+ Templates</h3>
                <p className="text-white/70 text-lg mb-6">
                  From vintage to futuristic, artistic to photorealistic
                </p>
                <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                  Browse Templates →
                </button>
              </div>
            </div>

            {/* Medium Feature 2 */}
            <div className="md:col-span-3 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-10 hover:border-white/40 transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <Palette className="h-14 w-14 text-yellow-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-black text-white mb-4">Professional Tools</h3>
                <p className="text-white/70 text-lg mb-6">
                  Fine-tune every detail with precision controls
                </p>
                <button className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                  Explore Tools →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 px-4 py-32 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '500K+', label: 'Images Created', icon: ImageIcon },
              { value: '10K+', label: 'Happy Users', icon: Star },
              { value: '99.9%', label: 'Satisfaction Rate', icon: Rocket },
            ].map((stat, i) => (
              <div 
                key={i}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-12 text-center hover:border-white/40 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-banana/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <stat.icon className="h-12 w-12 text-banana mx-auto mb-6 group-hover:scale-110 transition-transform" />
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4">
                    {stat.value}
                  </div>
                  <div className="text-xl text-white/70 font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-2xl border border-white/20 p-16 text-center">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-gradient-x" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
                Ready to Create Magic?
              </h2>
              <p className="text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
                Join thousands of creators transforming their images with AI
              </p>
              
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-banana via-yellow-400 to-orange-400 text-gray-900 font-black text-xl rounded-2xl hover:shadow-[0_30px_100px_rgba(255,230,109,0.6)] transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
              >
                Get Started Free
                <ArrowRight className="h-7 w-7 group-hover:translate-x-2 transition-transform" />
              </Link>
              
              <p className="text-white/60 mt-8 text-sm">
                No credit card required • Start creating in seconds
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
