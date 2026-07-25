import Link from 'next/link';
import { site } from '../lib/site';

/** Sitewide accessible header navigation (used on every public page). */
export default function SiteHeader() {
  return (
    <header className="shell nav">
      <Link href="/" className="brand" aria-label={`${site.name} — home`}>
        Desserty House
        <small>HANDMADE IN CHENNAI</small>
      </Link>
      <nav className="links" aria-label="Primary navigation">
        <Link href="/products">Products</Link>
        <Link href="/showcase">Gallery</Link>
        <Link href="/testimonials">Testimonials</Link>
        <Link href="/feedback">Feedback</Link>
        <Link href="/posts">Blog</Link>
        <Link href="/faq">FAQs</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Link className="mobile-nav" href="/products">Menu ↓</Link>
      <a className="btn gold nav-order" href={site.whatsappOrder} rel="noopener">
        WhatsApp to order
      </a>
    </header>
  );
}
