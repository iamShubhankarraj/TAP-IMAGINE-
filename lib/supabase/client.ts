// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
});

// Export type for use in other files
export type SupabaseClient = typeof supabase;

/**
 * Helper function to get user profile from Supabase
 * @param userId The user ID to fetch profile for
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

/**
 * Helper function to update user profile
 * @param userId The user ID to update profile for
 * @param updates The profile updates to apply
 */
export async function updateUserProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

/**
 * Helper function to upload an image to Supabase storage
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @param file The file to upload
 */
export async function uploadImage(bucket: string, path: string, file: File) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: publicURL } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return { data: publicURL, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error };
  }
}