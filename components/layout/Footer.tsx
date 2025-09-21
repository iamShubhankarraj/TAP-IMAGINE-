// components/layout/Footer.tsx
import Link from 'next/link';
import { 
  Github, Twitter, Instagram, Mail, Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-white/10 backdrop-blur-md bg-black/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-banana-dark">TAP<span className="text-white">[IMAGINE]</span></span>
            </Link>
            <p className="mt-3 text-white/70 text-sm">
              Transform your photos with the power of AI. Create stunning, creative images with just a few clicks.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-1">
            <h3 className="text-white font-medium mb-4">Features</h3>
            <ul className="space-y-2">
              {['AI Editing', 'Templates', 'Professional Tools', 'Image Adjustments', 'Export Options'].map((item, i) => (
                <li key={i}>
                  <Link href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              {['Help Center', 'Tutorials', 'Blog', 'Privacy Policy', 'Terms of Service'].map((item, i) => (
                <li key={i}>
                  <Link href="#" className="text-white/70 hover:text-white text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="mailto:contact@tapimagine.com" className="text-white/70 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-white/70 text-sm">
              Have questions? <Link href="/contact" className="text-banana hover:underline">Contact us</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © {currentYear} TAP[IMAGINE]. All rights reserved.
          </p>
          <p className="text-white/60 text-sm mt-4 md:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> and Google Nano Banana AI
          </p>
        </div>
      </div>
    </footer>
  );
}