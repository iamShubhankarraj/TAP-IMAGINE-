import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TAP[IMAGINE]',
    short_name: 'TAP[IMAGINE]',
    description: 'AI Image Editor powered by Gemini Nano Banana',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#0a0a0f',
    background_color: '#0a0a0f',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    id: 'com.tap.imagine',
    prefer_related_applications: false,
  };
}