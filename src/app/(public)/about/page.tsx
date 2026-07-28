import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';
import { getContent } from '@/lib/content';
import { getSettings, waOrderLink } from '@/lib/settings';
import { IconCheckCircle, IconArrowRight, IconChefHat } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About Us — Chennai Home Bakery Story',
  description:
    'Meet Desserty House, a Chennai home bakery crafting made-to-order brownies, bento cakes, birthday cakes, fondant art and fresh pizzas with egg and eggless options since 2023.',
  alternates: { canonical: '/about' },
  openGraph: { title: `About Us | ${site.name}`, url: '/about' },
};

export const revalidate = 60;

export default async function About() {
  const [content, settings] = await Promise.all([getContent(), getSettings()]);
  const aboutSchema = {
    '@type': 'AboutPage',
    '@id': abs('/about#webpage'),
    url: abs('/about'),
    name: `About ${site.name}`,
    about: { '@id': `${site.url}/#bakery` },
    isPartOf: { '@id': `${site.url}/#website` },
  };
  return (
    <main>
      <JsonLd data={aboutSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      <section className="shell section">
        <p className="eyebrow">OUR STORY</p>
        <div className="section-title-row">
          <IconChefHat size={28} className="section-icon" />
          <h1>About {site.name}</h1>
        </div>
        <p className="lead">{content.aboutLead}</p>

        {content.aboutBlocks.map((block) => (
          <div key={block.heading}>
            <h2>{block.heading}</h2>
            <p>{block.body}</p>
          </div>
        ))}

        <h2>How to reach us</h2>
        <p>
          Browse our <Link href="/products">menu</Link> or our{' '}
          <Link href="/showcase">gallery of previous creations</Link>, pick a style code, and send
          your date, quantity and preferences through the <Link href="/order">order form</Link> or
          directly on{' '}
          <a href={waOrderLink(settings)} rel="noopener">
            WhatsApp
          </a>
          . We deliver across {settings.deliveryAreas.join(', ')} and nearby localities — see the{' '}
          <Link href="/shipping-policy">delivery policy</Link>.
        </p>

        <h2>Why customers choose us</h2>
        <ul className="feature-list">
          {content.whyChooseUs.map((reason) => (
            <li key={reason}>
              <IconCheckCircle size={18} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <p>
          Read what our customers say on the <Link href="/testimonials">testimonials page</Link> and
          the <Link href="/feedback">feedback wall</Link>, or get in touch via the{' '}
          <Link href="/contact">contact page</Link>.
        </p>
        <Link className="btn gold icon-right" href="/order">
          Start an order <IconArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
