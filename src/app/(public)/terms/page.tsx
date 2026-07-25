import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for ordering from Desserty House Chennai: order confirmation, payment, customisation, allergens and liability.',
  alternates: { canonical: '/terms' },
};

export default function Terms() {
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Terms of Service', href: '/terms' }]} />
      <section className="shell section privacy-content">
        <p className="eyebrow">LEGAL</p>
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: 25 July 2026</p>

        <div className="policy-section">
          <h2>1. About these terms</h2>
          <p>
            These terms govern all orders placed with {site.legalName} (&quot;we&quot;, &quot;us&quot;), a home bakery
            operating in {site.address.locality}, {site.address.region}, India, through this website
            or WhatsApp. By placing an order you agree to these terms.
          </p>
        </div>

        <div className="policy-section">
          <h2>2. Orders and confirmation</h2>
          <ul>
            <li>All products are <strong>made to order</strong>. An order request is not confirmed until we personally confirm availability, design, price and delivery charge on WhatsApp.</li>
            <li>Each confirmed order receives a unique ID in the format <strong>DH-YYYY-XXXXXX</strong>, usable on the <Link href="/track">track order</Link> page.</li>
            <li>Minimum advance notice: 2 days for standard items, 5–7 days for custom fondant work, 2–4 weeks for wedding cakes.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>3. Pricing and payment</h2>
          <ul>
            <li>Prices are quoted individually based on product, size, design and quantity, in Indian Rupees (INR).</li>
            <li>Payment is by UPI or bank transfer, only after confirmation. We never request payment before confirming your order details.</li>
            <li>Delivery charges are additional and depend on your location in Chennai.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>4. Allergens and food safety</h2>
          <ul>
            <li>Our products are prepared in a kitchen that handles <strong>wheat (gluten), dairy, eggs, nuts and soy</strong>. Eggless does not mean allergen-free.</li>
            <li>Please inform us of allergies when ordering. We cannot guarantee zero cross-contact.</li>
            <li>Products are best consumed within the freshness window we communicate (typically 24–48 hours, refrigerated where advised).</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>5. Custom designs</h2>
          <p>
            Reference images are used as inspiration; handmade results may vary slightly in colour
            and detail. Copyright-restricted characters are crafted as artistic interpretations for
            private celebration use only.
          </p>
        </div>

        <div className="policy-section">
          <h2>6. Cancellations and refunds</h2>
          <p>See our <Link href="/refund-policy">Refund Policy</Link> for full details.</p>
        </div>

        <div className="policy-section">
          <h2>7. Liability</h2>
          <p>
            Our liability for any order is limited to the amount paid for that order. We are not
            liable for delays caused by events beyond our reasonable control (weather, traffic
            restrictions, power failures).
          </p>
        </div>

        <div className="policy-section">
          <h2>8. Contact</h2>
          <p>
            Questions about these terms? Contact us at <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>{' '}
            or <a href={`mailto:${site.email}`}>{site.email}</a>. See also our{' '}
            <Link href="/privacy">Privacy Policy</Link> and <Link href="/shipping-policy">Shipping Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
