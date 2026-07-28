import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description:
    'Desserty House refund and cancellation policy: free cancellation before payment, half refund 48+ hours before delivery, and how quality issues are resolved.',
  alternates: { canonical: '/refund-policy' },
};

export default function RefundPolicy() {
  return (
    <main>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Refund Policy', href: '/refund-policy' }]} />
      <section className="shell section privacy-content">
        <p className="eyebrow">LEGAL</p>
        <h1>Refund &amp; Cancellation Policy</h1>
        <p className="last-updated">Last updated: 25 July 2026</p>

        <div className="policy-section">
          <h2>Cancellations</h2>
          <ul>
            <li><strong>Before payment:</strong> cancel any time, free of charge.</li>
            <li><strong>48+ hours before delivery:</strong> 50% (half) refund of the amount paid.</li>
            <li><strong>24–48 hours before delivery:</strong> partial refund, depending on how much preparation (shopping, baking, decoration) has begun.</li>
            <li><strong>Less than 24 hours before delivery:</strong> no refund, as your order is already in production. We can reschedule delivery within Chennai where possible.</li>
            <li>Wedding and large custom orders: the booking advance is non-refundable within 7 days of the event date.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Quality issues</h2>
          <ul>
            <li>If your order arrives damaged or materially different from what was confirmed, contact us on <a href={site.whatsapp} rel="noopener">WhatsApp</a> with photos within <strong>2 hours of delivery</strong>.</li>
            <li>Verified issues are resolved with a remake (where timing allows), partial refund or full refund at our discretion, typically within 5–7 business days to the original payment method.</li>
            <li>Minor variations in colour, decoration placement or hand-crafted details are inherent to handmade products and are not defects.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Non-refundable situations</h2>
          <ul>
            <li>Change of mind after production has started.</li>
            <li>Incorrect delivery details provided by the customer.</li>
            <li>Product damage after successful delivery/pickup (improper transport or storage).</li>
            <li>Taste preference differences when the product matches the confirmed order.</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>How to request a refund</h2>
          <ol>
            <li>Message us on WhatsApp at <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a> with your order ID (DH-YYYY-XXXXXX).</li>
            <li>Describe the issue and attach photos if it is a quality concern.</li>
            <li>We respond within 24 hours with the resolution.</li>
          </ol>
          <p>
            See also: <Link href="/terms">Terms of Service</Link> ·{' '}
            <Link href="/shipping-policy">Shipping Policy</Link> ·{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
