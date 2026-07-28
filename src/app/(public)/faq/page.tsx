import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';
import { getContent } from '@/lib/content';
import { getSettings, waLink } from '@/lib/settings';
import { IconHelpCircle, IconChevronDown, IconArrowRight } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'FAQs — Ordering, Delivery, Eggless Options & Payments',
  description:
    'Frequently asked questions about ordering from Desserty House Chennai: advance notice, eggless options, pizza menu, delivery areas, pricing, payment, tracking and refunds.',
  alternates: { canonical: '/faq' },
  openGraph: { title: `FAQs | ${site.name}`, url: '/faq' },
};

/** FAQ page with FAQPage JSON-LD (rich-result eligible + LLM-friendly Q&A format). */
export const revalidate = 60;

export default async function FaqPage() {
  const [content, settings] = await Promise.all([getContent(), getSettings()]);
  const faqSchema = {
    '@type': 'FAQPage',
    '@id': abs('/faq#faqpage'),
    mainEntity: content.faqs.map((f) => ({
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
        <div className="section-title-row">
          <IconHelpCircle size={28} className="section-icon" />
          <h1>Frequently asked questions</h1>
        </div>
        <p className="muted">
          Everything about ordering handmade cakes, treats and pizzas from {site.name} in Chennai.
          Can&apos;t find your answer? <Link href="/contact">Contact us</Link> or message us on{' '}
          <a href={waLink(settings)} rel="noopener">WhatsApp</a>.
        </p>
        <div className="faq-list">
          {content.faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <IconChevronDown size={18} />
                <h2>{f.q}</h2>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <div className="notice" style={{ marginTop: '2rem' }}>
          Ready to order? Head to the <Link href="/order">order form</Link>, browse{' '}
          <Link href="/products">our products</Link>, or read our{' '}
          <Link href="/shipping-policy">delivery</Link> and{' '}
          <Link href="/refund-policy">refund</Link> policies.
          <br />
          <br />
          <Link className="btn gold icon-right" href="/order">
            Place an order <IconArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
