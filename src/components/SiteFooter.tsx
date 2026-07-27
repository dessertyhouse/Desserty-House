import Link from 'next/link';
import { site } from '../lib/site';
import { defaultSettings, waLink, type SiteSettings } from '../lib/settings';
import { getMenuProducts } from '../lib/menu';
import { IconPhone, IconMail, IconMapPin, IconInstagram, IconWhatsApp } from './Icons';

/**
 * Sitewide footer: only customer-relevant links (products, company pages,
 * policies) plus the NAP (Name/Address/Phone) block for Local SEO.
 * Machine files (sitemap, RSS, llms.txt) are intentionally NOT linked here —
 * crawlers find them via robots.txt and <link> tags, customers don't need them.
 * Contact details are admin-editable via Website Settings.
 */
export default async function SiteFooter({ settings = defaultSettings }: { settings?: SiteSettings }) {
  const visibleProducts = await getMenuProducts();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="brand footer-brand">Desserty House</p>
          <p className="muted">{site.tagline}.</p>
          <address className="footer-nap" itemScope itemType="https://schema.org/Bakery">
            <span itemProp="name">{site.name}</span>
            <br />
            <IconMapPin size={14} />{' '}
            <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="addressLocality">{site.address.locality}</span>,{' '}
              <span itemProp="addressRegion">{site.address.region}</span>,{' '}
              <span itemProp="addressCountry">India</span>
            </span>
            <br />
            <a href={`tel:+${settings.phoneDigits}`} itemProp="telephone">
              <IconPhone size={14} /> {settings.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${settings.email}`} itemProp="email">
              <IconMail size={14} /> {settings.email}
            </a>
          </address>
        </div>
        <nav aria-label="Products">
          <p className="footer-head">Our Menu</p>
          {visibleProducts.map((p) => (
            <Link key={p.slug} href={`/menu/${p.slug}`}>{p.name}</Link>
          ))}
          <Link href="/custom-cakes">Custom Cakes</Link>
          <Link href="/wedding-cakes">Wedding Cakes</Link>
        </nav>
        <nav aria-label="Company">
          <p className="footer-head">Explore</p>
          <Link href="/order">Place an order</Link>
          <Link href="/track">Track your order</Link>
          <Link href="/showcase">Gallery</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/feedback">Customer Feedback</Link>
          <Link href="/posts">Offers &amp; news</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav aria-label="Legal">
          <p className="footer-head">Policies</p>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/shipping-policy">Shipping &amp; Delivery</Link>
          <Link href="/refund-policy">Refund Policy</Link>
        </nav>
      </div>
      <div className="shell footer-bottom">
        <p>
          © {new Date().getFullYear()} {site.legalName}, {site.address.locality}. All rights reserved. ·{' '}
          <a href={settings.instagram} rel="noopener" className="icon-inline">
            <IconInstagram size={14} /> Instagram
          </a>{' '}
          ·{' '}
          <a href={waLink(settings)} rel="noopener" className="icon-inline">
            <IconWhatsApp size={14} /> WhatsApp
          </a>
        </p>
      </div>
    </footer>
  );
}
