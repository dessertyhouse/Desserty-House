import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Custom Cakes in Chennai — Any Theme, Egg & Eggless',
  description:
    'Order custom theme cakes in Chennai: fondant art, photo themes, baby showers, anniversaries and corporate cakes. Handmade to your design, egg & eggless. Book 5–7 days ahead.',
  alternates: { canonical: '/custom-cakes' },
  openGraph: { title: `Custom Cakes | ${site.name}`, url: '/custom-cakes' },
};

export default function CustomCakes() {
  const serviceSchema = {
    '@type': 'Service',
    '@id': abs('/custom-cakes#service'),
    name: 'Custom cake design',
    serviceType: 'Custom celebration cakes',
    provider: { '@id': `${site.url}/#bakery` },
    areaServed: site.areaServed.map((a) => ({ '@type': 'City', name: a })),
    description:
      'Fully customised celebration cakes designed around your theme, colours and occasion — fondant art, semi-fondant, buttercream and photo-inspired designs.',
  };
  return (
    <main>
      <JsonLd data={serviceSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Custom Cakes', href: '/custom-cakes' }]} />
      <section className="shell section">
        <p className="eyebrow">MADE AROUND YOUR THEME</p>
        <h1>Custom cakes in Chennai</h1>
        <p className="lead">
          Have a theme in mind? We design cakes around your idea — cartoon characters, florals,
          baby showers, anniversaries, farewells, corporate logos and more. Share a reference
          picture and we hand-craft it in our Chennai kitchen.
        </p>

        <h2>What we can create</h2>
        <ul>
          <li><strong>Fondant theme cakes</strong> — hand-modelled figures, flowers and toppers (see <Link href="/menu/fondant-cakes">fondant cakes</Link>)</li>
          <li><strong>Semi-fondant &amp; buttercream designs</strong> — softer finish, same personality</li>
          <li><strong>Bento &amp; mini cakes</strong> — personal-sized customisation (see <Link href="/menu/bento-cakes">bento cakes</Link>)</li>
          <li><strong>Number &amp; letter cakes, tiered cakes</strong> — for milestones and big parties</li>
          <li><strong>Dessert tables</strong> — matching <Link href="/menu/cupcakes">cupcakes</Link>, <Link href="/menu/brownies">brownies</Link> and <Link href="/menu/donuts">donuts</Link></li>
        </ul>

        <h2>How custom ordering works</h2>
        <ol>
          <li>Send your date, serving count, and a reference image or theme on <a href={site.whatsappOrder} rel="noopener">WhatsApp</a> or via the <Link href="/order">order form</Link>.</li>
          <li>We confirm feasibility, suggest options, and share a personal quote.</li>
          <li>Pay via UPI/bank transfer to confirm the slot. Custom work needs <strong>5–7 days advance booking</strong>.</li>
          <li>Track progress with your order ID on the <Link href="/track">track order page</Link>.</li>
        </ol>

        <p>
          Planning a wedding? See our dedicated <Link href="/wedding-cakes">wedding cakes page</Link>.
          For common questions on pricing and delivery, visit the <Link href="/faq">FAQ page</Link>.
        </p>
        <Link className="btn gold" href="/order">Request a custom cake</Link>
      </section>
    </main>
  );
}
