import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewForm from './ReviewForm';
import { site } from '@/lib/site';
import { getContent, aggregateRatingFrom } from '@/lib/content';
import { getSettings, waLink } from '@/lib/settings';
import { getApprovedReviews } from '@/lib/reviews';
import { IconStar, IconQuote, IconArrowRight, IconShield } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Testimonials — Verified Customer Reviews of Our Chennai Bakery',
  description:
    'Verified reviews from real Desserty House customers in Chennai: bento cakes, brownies, fondant birthday cakes, cupcakes, pizzas and more. Only customers who ordered can review.',
  alternates: { canonical: '/testimonials' },
  openGraph: { title: `Testimonials | ${site.name}`, url: '/testimonials' },
};

// Reviews are approved by the admin, so refresh often enough to feel live.
export const revalidate = 60;

export default async function Testimonials() {
  const [content, settings, verified] = await Promise.all([
    getContent(),
    getSettings(),
    getApprovedReviews(),
  ]);

  // Verified customer reviews come first; the curated list fills in behind them.
  const curated = content.testimonials
    .filter((t) => !t.hidden)
    .map((t) => ({ ...t, verified: false as const }));
  const all = [...verified, ...curated];
  const rating = aggregateRatingFrom(all);
  const verifiedCount = verified.length;

  const reviewSchema = {
    '@type': ['Bakery', 'LocalBusiness'],
    '@id': `${site.url}/#bakery`,
    name: site.name,
    ...(all.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: all.map((t) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: t.name },
            datePublished: t.date,
            reviewBody: t.text,
            itemReviewed: { '@id': `${site.url}/#bakery` },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: t.rating,
              bestRating: 5,
              worstRating: 1,
            },
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
          Rated {rating.ratingValue}/5 from {rating.reviewCount} review
          {rating.reviewCount === 1 ? '' : 's'}.{' '}
          {verifiedCount > 0 ? (
            <>
              <b>{verifiedCount}</b> {verifiedCount === 1 ? 'is' : 'are'} verified — written by
              customers who placed a real order with us.
            </>
          ) : (
            <>Every order is handmade, and every review is from a real celebration.</>
          )}
        </p>

        <div className="grid">
          {all.map((t, i) => (
            <article className="card testimonial-card" key={`${t.name}-${t.date}-${i}`}>
              <div>
                <p className="sku">
                  <span className="stars" aria-label={`Rated ${t.rating} out of 5`} role="img">
                    {Array.from({ length: 5 }, (_, n) => (
                      <IconStar key={n} size={14} filled={n < t.rating} />
                    ))}
                  </span>{' '}
                  · {t.product}
                </p>
                {t.verified && (
                  <p className="verified-badge">
                    <IconShield size={13} /> Verified order
                  </p>
                )}
                <blockquote>
                  <IconQuote size={22} className="quote-mark" />
                  <p>{t.text}</p>
                </blockquote>
                <p className="muted">
                  — {t.name},{' '}
                  <time dateTime={t.date}>
                    {new Date(t.date).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Verified review form — customers only */}
        <div style={{ marginTop: '2rem' }}>
          <ReviewForm />
        </div>

        <div className="notice" style={{ marginTop: '2rem' }}>
          You can also share your experience on{' '}
          <a href={settings.instagram} rel="noopener">Instagram</a> or{' '}
          <a href={waLink(settings)} rel="noopener">WhatsApp</a> — see the{' '}
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
