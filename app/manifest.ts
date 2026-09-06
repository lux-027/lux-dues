import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LuxDues — Site ve Aidat Takip Yönetim Sistemi',
    short_name: 'LuxDues',
    description:
      'Apartman ve site yönetimleri için aidat takip, ortak gider bölüşümü ve sakin portalı platformu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#18181b',
    lang: 'tr',
    icons: [
      {
        src: '/logo-white.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-white.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-white.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
