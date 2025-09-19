// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost', 'your-supabase-project.supabase.co'],
      formats: ['image/avif', 'image/webp'],
    },
    experimental: {
      serverActions: true,
    },
  }
  
  module.exports = nextConfig