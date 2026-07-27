import Link from 'next/link';
import { site } from '../lib/site';
import { defaultSettings, waOrderLink, type SiteSettings } from '../lib/settings';
import { IconMenuBars, IconWhatsApp, IconArrowRight, IconTrackPackage } from './Icons';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/showcase', label: 'Gallery' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/posts', label: 'Blog' },
  { href: '/faq', label: 'FAQs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Sitewide accessible header navigation (used on every public page).
 * Desktop: inline links. Mobile: CSS-only hamburger menu (<details>) with
 * every page + order/track shortcuts — no JavaScript required.
 * Contact details come from admin-editable settings.
 */
export default function SiteHeader({ settings = defaultSettings }: { settings?: SiteSettings }) {
  const wa = waOrderLink(settings);
  return (
    <header className="shell nav">
      <Link href="/" className="brand" aria-label={`${site.name} — home`}>
        Desserty House
        <small>HANDMADE IN CHENNAI</small>
      </Link>
      <nav className="links" aria-label="Primary navigation">
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Open navigation menu">
          <IconMenuBars size={18} /> Menu
        </summary>
        <nav className="mobile-menu-panel" aria-label="Mobile navigation">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
          <Link href="/order" className="mobile-menu-cta">
            Place an order <IconArrowRight size={15} />
          </Link>
          <Link href="/track">
            <IconTrackPackage size={15} /> Track your order
          </Link>
          <a href={wa} rel="noopener" className="mobile-menu-wa">
            <IconWhatsApp size={15} /> WhatsApp us: {settings.phoneDisplay}
          </a>
        </nav>
      </details>
      <a className="btn gold nav-order" href={wa} rel="noopener">
        <IconWhatsApp size={16} /> WhatsApp to order
      </a>
    </header>
  );
}
