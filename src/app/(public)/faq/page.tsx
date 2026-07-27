import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { faqs } from './data';
import { site, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'FAQs — Ordering, Delivery, Eggless Options & Payments',
  description:
    'Frequently asked questions about ordering from Desserty House Chennai: advance notice, eggless options, delivery areas, pricing, payment, tracking and refunds.',
  alternates: { canonical: '/faq' },
  openGraph: { title: `FAQs | ${site.name}`, url: '/faq' },
};

/** FAQ page with FAQPage JSON-LD (rich-result eligible + LLM-friendly Q&A format). */
export default function FaqPage() {
  const faqSchema = {
    '@type': 'FAQPage',
    '@id': abs('/faq#faqpage'),
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <main>
      <JsonLd data={faqSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'FAQs', href: '/faq' }]} />
      <section className="shell section">
        <p className="eyebrow">GOOD TO KNOW</p>
        <h1>Frequently asked questions</h1>
        <p className="muted">
          Everything about ordering handmade cakes and treats from {site.name} in Chennai. Can&apos;t
          find your answer? <Link href="/contact">Contact us</Link> or message us on{' '}
          <a href={site.whatsapp} rel="noopener">WhatsApp</a>.
        </p>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary><h2>{f.q}</h2></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <div className="notice" style={{ marginTop: '2rem' }}>
          Ready to order? Head to the <Link href="/order">order form</Link>, browse{' '}
          <Link href="/products">our products</Link>, or read our{' '}
          <Link href="/shipping-policy">delivery</Link> and{' '}
          <Link href="/refund-policy">refund</Link> policies.
        </div>
      </section>
    </main>
  );
}
