import type { MetadataRoute } from 'next';
import { site, abs } from '@/lib/site';
import { getMenuProducts } from '@/lib/menu';

/**
 * Auto-generated XML sitemap, served at /sitemap.xml.
 *
 * It is built from the LIVE menu, so:
 *  - a category the admin adds gets a sitemap entry automatically
 *  - a category the admin hides is removed from the sitemap automatically
 *  - style photos are listed with each product (Google image sitemap extension)
 *
 * Regenerated at most once an hour.
 */
export const revalidate = 3600;

const staticPages: {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[number]['changeFrequency'];
}[] = [
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getMenuProducts();

  return [
    ...staticPages.map((p) => ({
      url: p.path === '/' ? site.url : abs(p.path),
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    // Every live product page, with its gallery images
    ...products.map((p) => ({
      url: abs(`/menu/${p.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      // Style images may be relative API paths or absolute Cloudinary URLs
      images: p.gallery.map((g) => (g.image.startsWith('http') ? g.image : abs(g.image))),
    })),
  ];
}
