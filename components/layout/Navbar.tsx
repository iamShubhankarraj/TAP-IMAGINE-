// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-banana-dark">TAP<span className="text-primary">[IMAGINE]</span></span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-banana-dark">
                Dashboard
              </Link>
              <Link href="/editor" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-banana-dark">
                Editor
              </Link>
              <Link href="/templates" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-banana-dark">
                Templates
              </Link>
              
              {user ? (
                <>
                  <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-banana-dark">
                    Profile
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-banana-dark hover:bg-banana flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-banana-dark">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-banana-dark hover:bg-banana">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-banana-dark focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-banana-dark">
              Dashboard
            </Link>
            <Link href="/editor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-banana-dark">
              Editor
            </Link>
            <Link href="/templates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-banana-dark">
              Templates
            </Link>
            
            {user ? (
              <>
                <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-banana-dark">
                  Profile
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-banana-dark hover:bg-banana flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-banana-dark">
                  Login
                </Link>
                <Link href="/auth/signup" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-banana-dark hover:bg-banana">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}