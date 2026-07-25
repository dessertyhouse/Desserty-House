import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About Us — Chennai Home Bakery Story',
  description:
    'Meet Desserty House, a Chennai home bakery crafting made-to-order brownies, bento cakes, birthday cakes and fondant art with egg and eggless options since 2023.',
  alternates: { canonical: '/about' },
  openGraph: { title: `About Us | ${site.name}`, url: '/about' },
};

export default function About() {
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
        <h1>About {site.name}</h1>
        <p className="lead">
          {site.name} is a home bakery based in {site.address.locality}, {site.address.region},
          built on a simple idea: every celebration deserves something handmade.
        </p>

        <h2>What we do</h2>
        <p>
          We bake everything to order — rich fudge brownies, personal-sized bento cakes, statement
          birthday cakes, hand-sculpted fondant creations, cupcakes, donuts and Italian-style
          bomboloni. Every item is available in <strong>egg and eggless</strong> versions, baked in
          small batches for your specific delivery date. Nothing sits on a shelf.
        </p>

        <h2>How we work</h2>
        <p>
          Browse our <Link href="/products">menu</Link> or our{' '}
          <Link href="/showcase">gallery of previous creations</Link>, pick a style code, and send
          your date, quantity and preferences through the <Link href="/order">order form</Link> or
          directly on <a href={site.whatsappOrder} rel="noopener">WhatsApp</a>. We confirm the
          design, quote and delivery charge personally before you pay — no surprises.
        </p>

        <h2>Where we deliver</h2>
        <p>
          We deliver across Chennai, including {site.areaServed.slice(1).join(', ')} and nearby
          localities. Delivery charges depend on distance — details on our{' '}
          <Link href="/shipping-policy">delivery policy</Link> page. Self-pickup can also be arranged.
        </p>

        <h2>Why customers choose us</h2>
        <ul>
          <li>Freshly baked to order — never pre-made or frozen</li>
          <li>Egg and eggless options for every single product</li>
          <li>Fully customisable designs, themes and messages</li>
          <li>Personal WhatsApp confirmation before any payment</li>
          <li>Trackable orders with a unique order ID</li>
        </ul>
        <p>
          Read what our customers say on the <Link href="/testimonials">testimonials page</Link>,
          or get in touch via the <Link href="/contact">contact page</Link>.
        </p>
        <Link className="btn gold" href="/order">Start an order</Link>
      </section>
    </main>
  );
}
