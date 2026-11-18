import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/', name: 'Deldiet — The World in Your Cup', short_name: 'Deldiet',
    description: 'Explore coffee origins and discover your next daily ritual.',
    start_url: '/', scope: '/', display: 'standalone', lang: 'en-CA',
    background_color: '#f6f2e8', theme_color: '#171812',
    icons: [
      { src: '/brand/crimson/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/crimson/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/crimson/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Explore coffee origins', url: '/origins' },
      { name: 'Build a cup', url: '/build-a-cup' },
    ],
  };
}
