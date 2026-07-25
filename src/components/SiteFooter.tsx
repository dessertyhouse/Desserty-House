import Link from 'next/link';
import { site } from '../lib/site';
import { products } from '../app/products';

/**
 * Sitewide footer: internal links to every important page (SEO internal linking),
 * NAP (Name/Address/Phone) block for Local SEO, and legal links.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="brand footer-brand">Desserty House</p>
          <p className="muted">{site.tagline}.</p>
          <address className="footer-nap" itemScope itemType="https://schema.org/Bakery">
            <span itemProp="name">{site.name}</span>
            <br />
            <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="addressLocality">{site.address.locality}</span>,{' '}
              <span itemProp="addressRegion">{site.address.region}</span>,{' '}
              <span itemProp="addressCountry">India</span>
            </span>
            <br />
            <a href={`tel:${site.phone}`} itemProp="telephone">{site.phoneDisplay}</a>
            <br />
            <a href={`mailto:${site.email}`} itemProp="email">{site.email}</a>
          </address>
        </div>
        <nav aria-label="Products">
          <p className="footer-head">Products</p>
          {products.map((p) => (
            <Link key={p.slug} href={`/menu/${p.slug}`}>{p.name}</Link>
          ))}
          <Link href="/custom-cakes">Custom Cakes</Link>
          <Link href="/wedding-cakes">Wedding Cakes</Link>
        </nav>
        <nav aria-label="Company">
          <p className="footer-head">Company</p>
          <Link href="/about">About us</Link>
          <Link href="/showcase">Gallery</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/feedback">Customer Feedback</Link>
          <Link href="/posts">Blog &amp; offers</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/order">Place an order</Link>
          <Link href="/track">Track your order</Link>
        </nav>
        <nav aria-label="Legal">
          <p className="footer-head">Legal &amp; policies</p>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/shipping-policy">Shipping &amp; Delivery</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <a href="/rss.xml">RSS feed</a>
          <a href="/llms.txt">llms.txt</a>
        </nav>
      </div>
      <div className="shell footer-bottom">
        <p>
          © {new Date().getFullYear()} {site.legalName}, {site.address.locality}. All rights reserved. ·{' '}
          <a href={site.instagram} rel="noopener">Instagram</a> ·{' '}
          <a href={site.whatsapp} rel="noopener">WhatsApp</a>
        </p>
      </div>
    </footer>
  );
}
