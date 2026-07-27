import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site } from '@/lib/site';
import { getContent, aggregateRatingFrom } from '@/lib/content';
import { getSettings, waLink } from '@/lib/settings';
import { IconStar, IconQuote, IconArrowRight } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Testimonials — Customer Reviews of Our Chennai Bakery',
  description:
    'Read genuine customer reviews of Desserty House Chennai: bento cakes, brownies, fondant birthday cakes, cupcakes and more, rated by real customers.',
  alternates: { canonical: '/testimonials' },
  openGraph: { title: `Testimonials | ${site.name}`, url: '/testimonials' },
};

/** Testimonials page with Review + AggregateRating JSON-LD attached to the LocalBusiness. */
export const revalidate = 60;

export default async function Testimonials() {
  const [content, settings] = await Promise.all([getContent(), getSettings()]);
  const testimonials = content.testimonials;
  const rating = aggregateRatingFrom(testimonials);

  // Only emit rating schema when there is at least one real review.
  const reviewSchema = {
    '@type': ['Bakery', 'LocalBusiness'],
    '@id': `${site.url}/#bakery`,
    name: site.name,
    ...(rating.reviewCount > 0
      ? {
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
        }
      : {}),
  };

  return (
    <main>
      <JsonLd data={reviewSchema} />
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Testimonials', href: '/testimonials' }]}
      />
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
                <p className="sku">
                  <span className="stars" aria-label={`Rated ${t.rating} out of 5`} role="img">
                    {Array.from({ length: 5 }, (_, i) => (
                      <IconStar key={i} size={14} filled={i < t.rating} />
                    ))}
                  </span>{' '}
                  · {t.product}
                </p>
                <blockquote>
                  <IconQuote size={22} className="quote-mark" />
                  <p>{t.text}</p>
                </blockquote>
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
          <a href={settings.instagram} rel="noopener">Instagram</a> or{' '}
          <a href={waLink(settings)} rel="noopener">WhatsApp</a> — or see the{' '}
          <Link href="/feedback">customer feedback wall</Link>.
          <br />
          <br />
          <Link className="btn gold icon-right" href="/order">
            Place your next order <IconArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
