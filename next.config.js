// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
        },
        {
          protocol: 'https',
          hostname: '*.supabase.co',
        },
      ],
      formats: ['image/avif', 'image/webp'],
    },
  }
  
  module.exports = nextConfig