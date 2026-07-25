import './globals.css';
import type { Metadata, Viewport } from 'next';
import JsonLd from '@/components/JsonLd';
import { site, bakerySchema, organizationSchema, webSiteSchema } from '@/lib/site';

/**
 * Root layout: sitewide metadata defaults (every page inherits and can override),
 * PWA manifest, icons, and the global Schema.org graph
 * (Bakery + LocalBusiness + Organization + WebSite + SearchAction).
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Home Bakery in Chennai — Cakes, Brownies & Fondant Art`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'home bakery Chennai', 'homemade cakes Chennai', 'brownies Chennai', 'bento cakes Chennai',
    'fondant cakes Chennai', 'birthday cake Chennai', 'wedding cake Chennai', 'eggless cake Chennai',
    'custom cakes Chennai', 'cupcakes Chennai', 'donuts Chennai', 'bomboloni Chennai',
  ],
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  category: 'food',
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: `${site.name} — Blog & Offers` }] },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Handmade Cakes & Brownies in Chennai`,
    description: site.description,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${site.name} — handmade cakes and brownies in Chennai` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} | Handmade Cakes & Brownies in Chennai`,
    description: site.tagline,
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    'geo.region': 'IN-TN',
    'geo.placename': site.address.locality,
    'geo.position': `${site.geo.latitude};${site.geo.longitude}`,
    ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#26130d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <JsonLd data={[organizationSchema(), webSiteSchema(), bakerySchema()]} />
        {children}
      </body>
    </html>
  );
}
