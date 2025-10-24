// context/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types for profile data
type ProfileData = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

// Types for authentication context
type AuthContextType = {
  user: User | null;
  profile: ProfileData | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string; phone?: string }) => Promise<{ error: AuthError | Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signInWithApple: () => Promise<{ error: AuthError | Error | null }>;
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
};

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps app and makes auth context available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Supabase client with auth helpers
  const supabase = createClientComponentClient();

  // Fetch user profile from Supabase (non-blocking - app works without profiles table)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, phone')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Profiles table doesn't exist or no row for user - this is OK
        // The app will work fine without profile data
        return null;
      }
      
      return data as ProfileData;
    } catch (error) {
      // Silently fail - profile is optional
      return null;
    }
  };

  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  };

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get session and user
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser(currentSession.user);
          const profileData = await fetchProfile(currentSession.user.id);
          if (mounted) setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted) setProfile(profileData);
        } else {
          if (mounted) setProfile(null);
        }
        
        if (mounted) setIsLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata?: { first_name?: string; last_name?: string; phone?: string }
  ) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      // If signup successful and user is created (no email confirmation required)
      if (data.user && !error) {
        // Create profile immediately
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: metadata?.first_name || null,
              last_name: metadata?.last_name || null,
              phone: metadata?.phone || null,
              tier: 'free'
            });
          
          if (profileError) {
            console.error('Error creating profile during signup:', profileError);
            // Don't fail the signup, just log the error
          }
        } catch (profileErr) {
          console.error('Profile creation error during signup:', profileErr);
          // Don't fail the signup, just log the error
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If sign in successful, ensure profile exists
      if (data.user && !error) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                first_name: data.user.user_metadata?.first_name || null,
                last_name: data.user.user_metadata?.last_name || null,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                tier: 'free'
              });

            if (insertError) {
              console.error('Error creating profile during signin:', insertError);
            }
          }
        } catch (profileErr) {
          console.error('Profile check error during signin:', profileErr);
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error };
    } catch (error) {
      console.error('Apple sign in error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (!error) {
        // Refresh profile data after update
        await refreshProfile();
      }
      
      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Create context value object
  const value = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithApple,
    updateProfile,
    refreshProfile,
    resetPassword
  };

  // Provide context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};