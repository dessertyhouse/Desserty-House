import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { testimonials, aggregateRating } from './data';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Testimonials — Customer Reviews of Our Chennai Bakery',
  description:
    'Read genuine customer reviews of Desserty House Chennai: bento cakes, brownies, fondant birthday cakes, cupcakes and more, rated by real customers.',
  alternates: { canonical: '/testimonials' },
  openGraph: { title: `Testimonials | ${site.name}`, url: '/testimonials' },
};

/** Testimonials page with Review + AggregateRating JSON-LD attached to the LocalBusiness. */
export default function Testimonials() {
  const rating = aggregateRating();
  const reviewSchema = {
    '@type': ['Bakery', 'LocalBusiness'],
    '@id': `${site.url}/#bakery`,
    name: site.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.ratingValue,
      reviewCount: rating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: testimonials.map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.name },
      datePublished: t.date,
      reviewBody: t.text,
      itemReviewed: { '@id': `${site.url}/#bakery` },
      reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: 5, worstRating: 1 },
    })),
  };
  return (
    <main>
      <JsonLd data={reviewSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Testimonials', href: '/testimonials' }]} />
      <section className="shell section">
        <p className="eyebrow">CUSTOMER LOVE</p>
        <h1>What our customers say</h1>
        <p className="muted">
          Rated {rating.ratingValue}/5 from {rating.reviewCount} reviews. Every order is handmade —
          and every review below is from a real celebration.
        </p>
        <div className="grid">
          {testimonials.map((t) => (
            <article className="card testimonial-card" key={t.name + t.date}>
              <div>
                <p className="sku" aria-label={`Rated ${t.rating} out of 5`}>
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)} · {t.product}
                </p>
                <blockquote><p>{t.text}</p></blockquote>
                <p className="muted">
                  — {t.name},{' '}
                  <time dateTime={t.date}>
                    {new Date(t.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </time>
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="notice" style={{ marginTop: '2rem' }}>
          Loved your order? Share your experience on{' '}
          <a href={site.instagram} rel="noopener">Instagram</a> or{' '}
          <a href={site.whatsapp} rel="noopener">WhatsApp</a> — or{' '}
          <Link href="/order">place your next order</Link>.
        </div>
      </section>
    </main>
  );
}
