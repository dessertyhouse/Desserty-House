import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — Chennai Delivery Areas',
  description:
    'Desserty House delivery policy: Chennai delivery areas, charges, timelines, self-pickup and how fresh bakes are transported safely.',
  alternates: { canonical: '/shipping-policy' },
};

export default function ShippingPolicy() {
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Shipping Policy', href: '/shipping-policy' }]} />
      <section className="shell section privacy-content">
        <p className="eyebrow">LEGAL</p>
        <h1>Shipping &amp; Delivery Policy</h1>
        <p className="last-updated">Last updated: 25 July 2026</p>

        <div className="policy-section">
          <h2>Delivery areas</h2>
          <p>
            We deliver across Chennai, Tamil Nadu — including {site.areaServed.slice(1).join(', ')}{' '}
            and nearby localities. If you are unsure whether we cover your area, message us on{' '}
            <a href={site.whatsapp} rel="noopener">WhatsApp</a> before ordering.
          </p>
        </div>

        <div className="policy-section">
          <h2>Delivery charges</h2>
          <ul>
            <li>Delivery is charged separately based on distance from our kitchen and is confirmed on WhatsApp <strong>before</strong> you pay.</li>
            <li>Fragile items (tiered and fondant cakes) may require premium careful-handling delivery.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Delivery timelines</h2>
          <ul>
            <li>Orders are delivered on the date agreed at confirmation, within a mutually agreed time window.</li>
            <li>Fresh items are baked the same day or the evening before delivery.</li>
            <li>For weddings and large events we recommend a morning delivery slot.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Self-pickup</h2>
          <p>
            Self-pickup can be arranged at no charge. The pickup address in {site.address.locality} is
            shared on WhatsApp after your order is confirmed.
          </p>
        </div>

        <div className="policy-section">
          <h2>Care instructions</h2>
          <ul>
            <li>Cakes travel best flat, air-conditioned and held from the base.</li>
            <li>Refrigerate cream cakes on arrival; serve 20–30 minutes after removing from the fridge.</li>
            <li>Brownies, donuts and bomboloni are best enjoyed within 24–48 hours.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Issues with delivery</h2>
          <p>
            If your order arrives damaged, send photos on WhatsApp within 2 hours of delivery — see
            our <Link href="/refund-policy">Refund Policy</Link> for how we resolve issues.
          </p>
        </div>
      </section>
    </main>
  );
}
