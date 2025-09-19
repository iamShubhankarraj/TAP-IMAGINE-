// app/page.tsx
import Link from 'next/link';
import { ArrowRight, Sparkles, Image, Zap, LayoutGrid } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-banana-dark">TAP</span>
          <span className="text-primary">[IMAGINE]</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your photos with the power of AI. Create stunning, creative images with just a few clicks.
        </p>
        <div className="mt-8">
          <Link href="/editor" className="inline-flex items-center gap-2 px-6 py-3 bg-banana-dark text-white rounded-md hover:bg-banana hover:text-gray-800 transition-colors text-lg font-medium">
            Start Creating
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center p-3 bg-banana-light rounded-full mb-4">
            <Sparkles className="h-6 w-6 text-banana-dark" />
          </div>
          <h2 className="text-xl font-semibold mb-3">AI-Powered Edits</h2>
          <p className="text-gray-600">
            Transform your photos with simple text prompts. Our AI understands what you want and makes it happen.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center p-3 bg-banana-light rounded-full mb-4">
            <LayoutGrid className="h-6 w-6 text-banana-dark" />
          </div>
          <h2 className="text-xl font-semibold mb-3">Creative Templates</h2>
          <p className="text-gray-600">
            Choose from 20+ creative templates for one-click transformations. From vintage to futuristic, we've got you covered.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center p-3 bg-banana-light rounded-full mb-4">
            <Zap className="h-6 w-6 text-banana-dark" />
          </div>
          <h2 className="text-xl font-semibold mb-3">Professional Tools</h2>
          <p className="text-gray-600">
            Fine-tune your creations with professional adjustment tools. Perfect every detail of your image.
          </p>
        </div>
      </section>

      <section className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-6">See What You Can Create</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* In a real app, these would be actual example images */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <Image className="h-8 w-8 text-gray-400" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-banana-light rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to transform your photos?</h2>
        <p className="text-gray-700 mb-6">
          Join thousands of creators using TAP[IMAGINE] to bring their creative visions to life.
        </p>
        <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-banana-dark text-white rounded-md hover:bg-banana hover:text-gray-800 transition-colors font-medium">
          Get Started Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}