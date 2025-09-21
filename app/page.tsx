// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Sparkles, Wand2, Image as ImageIcon, 
  Layers, Zap, Download, Palette, Users
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-pink-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-block p-2 bg-white/10 backdrop-blur-md rounded-full">
              <Sparkles className="h-6 w-6 text-banana" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Transform Your Images with <span className="text-banana">AI Magic</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mb-10">
              TAP[IMAGINE] combines the power of AI with professional editing tools to help you create stunning, unique images with just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/editor" className="px-8 py-4 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                Start Creating
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/templates" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                Explore Templates
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 max-w-5xl mx-auto relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image 
                src="/demo-editor.jpg" 
                alt="TAP[IMAGINE] Editor Interface"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
            </div>
            {/* Floating elements for decoration */}
            <div className="absolute -top-8 -left-8 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl hidden md:block">
              <Wand2 className="h-6 w-6 text-banana" />
            </div>
            <div className="absolute -bottom-6 -right-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl hidden md:block">
              <Layers className="h-6 w-6 text-banana" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Features, Simple Interface
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Everything you need to transform your images, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
              <div className="rounded-full bg-banana/20 w-14 h-14 flex items-center justify-center mb-6">
                <Wand2 className="h-7 w-7 text-banana" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI-Powered Transformations</h3>
              <p className="text-white/70 mb-6">
                Simply describe what you want with natural language, and watch as AI brings your vision to life.
              </p>
              <ul className="space-y-2">
                {['Text-based prompts', 'Multiple reference images', 'Style transfer', 'Creative effects'].map((item, i) => (
                  <li key={i} className="flex items-center text-white/60 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-banana mr-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
              <div className="rounded-full bg-banana/20 w-14 h-14 flex items-center justify-center mb-6">
                <ImageIcon className="h-7 w-7 text-banana" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Creative Templates</h3>
              <p className="text-white/70 mb-6">
                Get inspired with our collection of templates for quick and stunning transformations.
              </p>
              <ul className="space-y-2">
                {['20+ preset styles', 'One-click application', 'Vintage to futuristic', 'Artistic to realistic'].map((item, i) => (
                  <li key={i} className="flex items-center text-white/60 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-banana mr-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
              <div className="rounded-full bg-banana/20 w-14 h-14 flex items-center justify-center mb-6">
                <Palette className="h-7 w-7 text-banana" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Tools</h3>
              <p className="text-white/70 mb-6">
                Fine-tune your creations with precision using our professional-grade editing tools.
              </p>
              <ul className="space-y-2">
                {['Image adjustments', 'Filters & effects', 'Aspect ratio control', 'High-quality export'].map((item, i) => (
                  <li key={i} className="flex items-center text-white/60 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-banana mr-2"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 px-4 relative bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See What's Possible
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From subtle enhancements to complete transformations, the possibilities are endless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example transformations - in a real app, these would be actual before/after images */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center relative">
                  {/* Replace with actual before/after images */}
                  <div className="text-white/30">Example {i}</div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-banana text-gray-900 rounded-full font-medium">
                      Try This Style
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-white font-medium">Transformation Example {i}</h4>
                  <p className="text-white/60 text-sm">Vintage film style with warm tones</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/editor" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/20 transition-colors inline-flex items-center gap-2">
              Create Your Own
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Transform your images in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-banana text-gray-900 flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Your Image</h3>
              <p className="text-white/70">
                Upload the image you want to transform. Add reference images if you have a specific style in mind.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-banana text-gray-900 flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-white mb-3">Describe or Select</h3>
              <p className="text-white/70">
                Type what you want or choose from our templates. The AI understands your vision.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-banana text-gray-900 flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-white mb-3">Download & Share</h3>
              <p className="text-white/70">
                Fine-tune the results with our tools, then download or share your creation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-20 px-4 relative bg-black/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-banana mb-2">500K+</div>
              <p className="text-white">Images Transformed</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-banana mb-2">20+</div>
              <p className="text-white">Creative Templates</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold text-banana mb-2">50K+</div>
              <p className="text-white">Happy Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-violet-900 to-purple-800 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-banana/20 rounded-full filter blur-xl opacity-60"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full filter blur-xl opacity-60"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Images?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are bringing their creative visions to life with TAP[IMAGINE].
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup" className="px-8 py-4 bg-banana text-gray-900 font-medium rounded-full hover:bg-banana-light transition-colors shadow-lg flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/templates" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  Explore Templates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}