import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us — Order on WhatsApp or Visit Us in Chennai',
  description:
    'Contact Desserty House, Chennai home bakery: WhatsApp +91 89394 11490, Instagram @dessertyhouse. Business hours, delivery areas and location map.',
  alternates: { canonical: '/contact' },
  openGraph: { title: `Contact | ${site.name}`, url: '/contact' },
};

/** Contact page with ContactPage JSON-LD, NAP details, business hours and an embedded map. */
export default function Contact() {
  const contactSchema = {
    '@type': 'ContactPage',
    '@id': abs('/contact#webpage'),
    url: abs('/contact'),
    name: `Contact ${site.name}`,
    about: { '@id': `${site.url}/#bakery` },
    isPartOf: { '@id': `${site.url}/#website` },
  };
  return (
    <main>
      <JsonLd data={contactSchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <section className="shell section">
        <p className="eyebrow">WE&apos;D LOVE TO HEAR FROM YOU</p>
        <h1>Contact {site.name}</h1>
        <div className="contact-grid">
          <div>
            <h2>Reach us</h2>
            <address>
              <p><strong>WhatsApp / Phone:</strong> <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a></p>
              <p><strong>WhatsApp direct:</strong> <a href={site.whatsappOrder} rel="noopener">Message us to order</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${site.email}`}>{site.email}</a></p>
              <p><strong>Instagram:</strong> <a href={site.instagram} rel="noopener">@dessertyhouse</a></p>
              <p>
                <strong>Location:</strong> {site.address.locality}, {site.address.region}, India
                {site.address.streetAddress ? ` — ${site.address.streetAddress}` : ''}
              </p>
            </address>

            <h2>Business hours</h2>
            <ul>
              {site.openingHours.map((h) => (
                <li key={h.days.join()}>
                  {h.days.length > 1 ? `${h.days[0]}–${h.days[h.days.length - 1]}` : h.days[0]}:{' '}
                  {h.opens}–{h.closes}
                </li>
              ))}
            </ul>

            <h2>Delivery areas</h2>
            <p>{site.areaServed.join(' · ')} — full details on the <Link href="/shipping-policy">delivery policy</Link> page.</p>
            <Link className="btn gold" href="/order">Start an order</Link>
          </div>
          <div>
            <h2>Find us on the map</h2>
            <iframe
              title={`${site.name} location map — ${site.address.locality}`}
              src={`https://www.google.com/maps?q=${site.geo.latitude},${site.geo.longitude}&z=12&output=embed`}
              width="100%"
              height="360"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <p className="muted">
              We are a home bakery — orders are pre-order only via WhatsApp or the{' '}
              <Link href="/order">order form</Link>. Pickup address is shared after order confirmation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
