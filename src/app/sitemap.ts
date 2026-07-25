import type { MetadataRoute } from 'next';
import { products } from './products';
import { site } from '@/lib/site';

/**
 * Auto-generated XML sitemap, served at /sitemap.xml.
 * It is built from code at request/build time, so any product added to
 * src/app/products.ts (or any static page added to the list below) is
 * included automatically — no manual sitemap editing needed.
 */
const staticPages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, freq: 'weekly' },
  { path: '/products', priority: 0.9, freq: 'weekly' },
  { path: '/custom-cakes', priority: 0.9, freq: 'monthly' },
  { path: '/wedding-cakes', priority: 0.9, freq: 'monthly' },
  { path: '/showcase', priority: 0.9, freq: 'weekly' },
  { path: '/order', priority: 0.9, freq: 'monthly' },
  { path: '/posts', priority: 0.8, freq: 'daily' },
  { path: '/testimonials', priority: 0.7, freq: 'monthly' },
  { path: '/feedback', priority: 0.7, freq: 'weekly' },
  { path: '/about', priority: 0.7, freq: 'monthly' },
  { path: '/faq', priority: 0.7, freq: 'monthly' },
  { path: '/contact', priority: 0.7, freq: 'monthly' },
  { path: '/track', priority: 0.5, freq: 'yearly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
  { path: '/terms', priority: 0.3, freq: 'yearly' },
  { path: '/shipping-policy', priority: 0.4, freq: 'yearly' },
  { path: '/refund-policy', priority: 0.4, freq: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...staticPages.map((p) => ({
      url: `${site.url}${p.path === '/' ? '' : p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    // Every product page, with its gallery images (Google image sitemap extension)
    ...products.map((p) => ({
      url: `${site.url}/menu/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: p.gallery.map((g) => `${site.url}${g.image}`),
    })),
  ];
}
