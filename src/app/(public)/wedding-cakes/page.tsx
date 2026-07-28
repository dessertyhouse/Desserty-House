import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Wedding Cakes in Chennai — Tiered, Fondant & Buttercream',
  description:
    'Handmade wedding and engagement cakes in Chennai: elegant tiered cakes, fondant florals and buttercream finishes. Egg & eggless. Book 2–4 weeks ahead for weddings.',
  alternates: { canonical: '/wedding-cakes' },
  openGraph: { title: `Wedding Cakes | ${site.name}`, url: '/wedding-cakes' },
};

export default function WeddingCakes() {
  const serviceSchema = {
    '@type': 'Service',
    '@id': abs('/wedding-cakes#service'),
    name: 'Wedding cake design',
    serviceType: 'Wedding and engagement cakes',
    provider: { '@id': `${site.url}/#bakery` },
    areaServed: site.areaServed.map((a) => ({ '@type': 'City', name: a })),
    description:
      'Elegant tiered wedding cakes, engagement cakes and reception desserts handmade in Chennai with fondant florals or buttercream finishes.',
  };
  return (
    <main>
      <JsonLd data={serviceSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Wedding Cakes', href: '/wedding-cakes' }]} />
      <section className="shell section">
        <p className="eyebrow">FOR YOUR BIG DAY</p>
        <h1>Wedding cakes in Chennai</h1>
        <p className="lead">
          From intimate engagement celebrations to grand receptions, we craft wedding cakes that
          match your décor, colour palette and story — handmade, fresh, and available egg or eggless.
        </p>

        <h2>Our wedding offerings</h2>
        <ul>
          <li><strong>Tiered wedding cakes</strong> — two and three tiers with fondant or buttercream finish</li>
          <li><strong>Engagement &amp; reception cakes</strong> — single-tier statement designs</li>
          <li><strong>Fondant florals &amp; toppers</strong> — hand-crafted sugar flowers and personalised toppers</li>
          <li><strong>Dessert &amp; favour tables</strong> — <Link href="/menu/cupcakes">cupcakes</Link>, <Link href="/menu/brownies">brownie</Link> favour boxes, <Link href="/menu/bomboloni">bomboloni</Link> towers</li>
        </ul>

        <h2>Timeline &amp; booking</h2>
        <ol>
          <li><strong>2–4 weeks before:</strong> share your date, venue area, guest count and inspiration images on <a href={site.whatsappOrder} rel="noopener">WhatsApp</a>.</li>
          <li><strong>Design &amp; quote:</strong> we finalise the design, flavours (with a tasting discussion) and total price.</li>
          <li><strong>Advance payment:</strong> a booking advance confirms your date.</li>
          <li><strong>Delivery day:</strong> careful delivery and setup guidance for your venue in Chennai.</li>
        </ol>

        <p>
          See real examples in our <Link href="/showcase">gallery</Link>, read{' '}
          <Link href="/testimonials">customer testimonials</Link>, or check the{' '}
          <Link href="/faq">FAQ</Link> for delivery and payment details.
        </p>
        <Link className="btn gold" href="/order">Enquire about a wedding cake</Link>
      </section>
    </main>
  );
}
