import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** PWA web app manifest, served at /manifest.json (linked from the root layout). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Handmade Cakes & Brownies in Chennai`,
    short_name: site.name,
    description: site.description,
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff8f2',
    theme_color: '#26130d',
    lang: 'en-IN',
    dir: 'ltr',
    categories: ['food', 'shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Place an order', url: '/order', description: 'Order cakes and treats' },
      { name: 'Track order', url: '/track', description: 'Check your order status' },
      { name: 'Products', url: '/products', description: 'Browse the menu' },
    ],
  };
}
