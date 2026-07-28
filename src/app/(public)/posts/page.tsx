import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ItemLinks from '@/components/ItemLinks';
import { site, abs } from '@/lib/site';
import { imgAttrs } from '@/app/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog & Offers — Seasonal Treats and Sweet News',
  description:
    'Latest from Desserty House Chennai: seasonal offers, new product launches, festive pre-order announcements and baking updates.',
  alternates: {
    canonical: '/posts',
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: `${site.name} — Blog & Offers` }] },
  },
  openGraph: { title: `Blog & Offers | ${site.name}`, url: '/posts' },
};

/** Blog/offers page with Blog JSON-LD; content comes from Supabase `posts` table. */
export default async function Posts() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const { data: result } = await db
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .neq('kind', 'feedback')
    .order('created_at', { ascending: false });
  const data = result ?? [];

  const blogSchema = {
    '@type': 'Blog',
    '@id': abs('/posts#blog'),
    name: `${site.name} — Blog & Offers`,
    url: abs('/posts'),
    publisher: { '@id': `${site.url}/#organization` },
    blogPost: data.slice(0, 20).map((p: any) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.created_at,
      image: p.image_url,
      author: { '@id': `${site.url}/#organization` },
    })),
  };

  return (
    <main>
      <JsonLd data={blogSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Blog & Offers', href: '/posts' }]} />
      <section className="showcase-hero">
        <div className="shell">
          <p className="eyebrow">LATEST FROM DESSERTY HOUSE</p>
          <h1>Offers, launches &amp; sweet news</h1>
          <p>
            Fresh updates, seasonal treats and limited celebration offers. Pre-order early on{' '}
            <a href={site.whatsappOrder} rel="noopener">WhatsApp</a> — or subscribe to our{' '}
            <a href="/rss.xml">RSS feed</a>.
          </p>
        </div>
      </section>
      <section className="shell section">
        {data.length ? (
          <div className="showcase-grid">
            {data.map((p: any) => (
              <article className="showcase-card" key={p.id}>
                <img
                  {...imgAttrs(p.image_url)}
                  alt={`${p.title} — ${site.name} offer`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                />
                <div>
                  <span className="sku">{p.kind?.toUpperCase() || 'UPDATE'}</span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <ItemLinks links={p.links} />
                  <Link className="text-link" href="/order">Ask about this →</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="notice">
            <b>New offers are coming soon.</b>
            <br />
            Follow {site.legalName} on <a href={site.instagram} rel="noopener">Instagram</a> or
            message us on <a href={site.whatsapp} rel="noopener">WhatsApp</a> for current
            availability. Meanwhile, browse <Link href="/products">our products</Link>.
          </div>
        )}
      </section>
    </main>
  );
}
