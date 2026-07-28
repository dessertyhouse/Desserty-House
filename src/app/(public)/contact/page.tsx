import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site, abs } from '@/lib/site';
import { getSettings, waOrderLink } from '@/lib/settings';
import {
  IconPhone,
  IconWhatsApp,
  IconMail,
  IconInstagram,
  IconMapPin,
  IconClock,
  IconTruck,
  IconArrowRight,
} from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Contact Us — Order on WhatsApp or Visit Us in Chennai',
  description:
    'Contact Desserty House, Chennai home bakery: WhatsApp +91 89394 11490, Instagram @dessertyhouse. Business hours, delivery areas and location map.',
  alternates: { canonical: '/contact' },
  openGraph: { title: `Contact | ${site.name}`, url: '/contact' },
};

/** Contact page with ContactPage JSON-LD, NAP details, business hours and an embedded map. */
export const revalidate = 60;

export default async function Contact() {
  const settings = await getSettings();
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
              <p className="contact-line">
                <IconPhone size={18} />
                <span>
                  <strong>WhatsApp / Phone:</strong>{' '}
                  <a href={`tel:+${settings.phoneDigits}`}>{settings.phoneDisplay}</a>
                </span>
              </p>
              <p className="contact-line">
                <IconWhatsApp size={18} />
                <span>
                  <strong>WhatsApp direct:</strong>{' '}
                  <a href={waOrderLink(settings)} rel="noopener">Message us to order</a>
                </span>
              </p>
              <p className="contact-line">
                <IconMail size={18} />
                <span>
                  <strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </span>
              </p>
              <p className="contact-line">
                <IconInstagram size={18} />
                <span>
                  <strong>Instagram:</strong>{' '}
                  <a href={settings.instagram} rel="noopener">@dessertyhouse</a>
                </span>
              </p>
              <p className="contact-line">
                <IconMapPin size={18} />
                <span>
                  <strong>Location:</strong> {site.address.locality}, {site.address.region}, India
                  {site.address.streetAddress ? ` — ${site.address.streetAddress}` : ''}
                </span>
              </p>
            </address>

            <div className="section-title-row">
              /** <IconClock size={22} className="section-icon" /> **/
              <h2>Business hours</h2>
            </div>
            <p>{settings.hoursText}</p>

            <div className="section-title-row">
              <IconTruck size={22} className="section-icon" />
              <h2>Delivery areas</h2>
            </div>
            <p>{settings.deliveryAreas.join(' · ')} — full details on the <Link href="/shipping-policy">delivery policy</Link> page.</p>
            <Link className="btn gold icon-right" href="/order">
              Start an order <IconArrowRight size={17} />
            </Link>
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
