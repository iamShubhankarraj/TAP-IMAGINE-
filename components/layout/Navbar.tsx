// components/layout/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  Menu, X, User, LogOut, ChevronDown, 
  Image as ImageIcon, Grid, Settings, Home
} from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Navigation items
  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Features', href: '/features', icon: <Settings className="h-5 w-5" /> },
    { name: 'Editor', href: '/editor', icon: <ImageIcon className="h-5 w-5" /> },
    { name: 'Templates', href: '/templates', icon: <Grid className="h-5 w-5" /> },
  ];

  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') {
      return false;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full border-b border-white/10 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md bg-black/40' : 'backdrop-blur-sm bg-black/20'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-banana-dark">TAP<span className="text-white">[IMAGINE]</span></span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* User section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full pr-3 pl-2 py-1.5"
                >
                  <div className="w-8 h-8 rounded-full bg-banana-dark flex items-center justify-center text-gray-900 font-semibold">
                    {user.email?.charAt(0).toUpperCase() || <User size={16} />}
                  </div>
                  <span className="text-white/90 text-sm">{user.email?.split('@')[0] || 'User'}</span>
                  <ChevronDown size={16} className="text-white/70" />
                </button>
                
                {/* User dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-10">
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                      >
                        Settings
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-banana text-gray-900 hover:bg-banana-light transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5"
                >
                  <User size={20} />
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Settings size={20} />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 pb-1">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-center text-base font-medium text-white hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-center text-base font-medium bg-banana text-gray-900 hover:bg-banana-light transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}