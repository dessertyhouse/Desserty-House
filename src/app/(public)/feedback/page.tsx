import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Feedback — Real Screenshots from Happy Customers',
  description:
    'Real customer feedback for Desserty House Chennai: genuine WhatsApp and Instagram messages from customers about our cakes, brownies, pizzas and treats.',
  alternates: { canonical: '/feedback' },
  openGraph: { title: `Customer Feedback | ${site.name}`, url: '/feedback' },
};

/**
 * Customer feedback wall. The admin uploads feedback screenshots from the
 * admin dashboard (Post type: "Customer Feedback"); they are stored in the
 * same Supabase `posts` table with kind='feedback' and shown here publicly.
 */
export default async function Feedback() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const { data: result } = await db
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .eq('kind', 'feedback')
    .order('created_at', { ascending: false });
  const data = result ?? [];

  const gallerySchema = {
    '@type': 'ImageGallery',
    '@id': abs('/feedback#gallery'),
    name: `${site.name} — customer feedback screenshots`,
    url: abs('/feedback'),
    about: { '@id': `${site.url}/#bakery` },
    image: data.slice(0, 30).map((p: any) => ({
      '@type': 'ImageObject',
      contentUrl: p.image_url,
      name: p.title,
      description: p.description,
    })),
  };

  return (
    <main>
      <JsonLd data={gallerySchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Customer Feedback', href: '/feedback' }]} />
      <section className="showcase-hero">
        <div className="shell">
          <p className="eyebrow">STRAIGHT FROM OUR CUSTOMERS</p>
          <h1>Real customer feedback</h1>
          <p>
            Genuine WhatsApp and Instagram messages our customers sent us after their orders,
            shared here with their permission. Want yours on the wall? Send it to us on{' '}
            <a href={site.whatsapp} rel="noopener">WhatsApp</a> or tag us on{' '}
            <a href={site.instagram} rel="noopener">Instagram</a>. Looking for star ratings instead?
            See our <Link href="/testimonials">verified reviews</Link>.
          </p>
        </div>
      </section>
      <section className="shell section">
        {data.length ? (
          <div className="feedback-grid">
            {data.map((p: any) => (
              <figure className="feedback-card" key={p.id}>
                <img
                  src={p.image_url}
                  alt={`Customer feedback: ${p.title} — ${site.name} Chennai`}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <b>{p.title}</b>
                  {p.description ? <p>{p.description}</p> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="notice">
            <b>Feedback wall coming soon.</b>
            <br />
            We are collecting customer screenshots. Meanwhile, read our{' '}
            <Link href="/testimonials">testimonials</Link> or browse{' '}
            <Link href="/showcase">previous creations</Link>.
          </div>
        )}
        <div className="notice" style={{ marginTop: '2rem' }}>
          Loved your order? Your screenshot could be here — message us on{' '}
          <a href={site.whatsapp} rel="noopener">WhatsApp</a>. Ready for your own sweet moment?{' '}
          <Link href="/order">Place an order</Link>.
        </div>
      </section>
    </main>
  );
}
