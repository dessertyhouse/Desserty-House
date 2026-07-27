/**
 * Central site configuration — single source of truth for SEO, GEO and schema data.
 * EDIT THIS FILE FIRST: every page, sitemap, robots.txt, RSS feed and JSON-LD
 * block reads from here, so updating a value here updates it everywhere.
 */

export const site = {
  /** Canonical production URL. Override with NEXT_PUBLIC_SITE_URL env var (no trailing slash). */
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://desserty-house.vercel.app').replace(/\/$/, ''),
  name: 'Desserty House',
  legalName: 'Dessert(y) House',
  tagline: 'Handmade cakes, brownies & fondant art in Chennai',
  description:
    'Desserty House is a home bakery in Chennai, Tamil Nadu offering made-to-order brownies, bento cakes, birthday cakes, custom fondant cakes, cupcakes, donuts, bomboloni and fresh hand-stretched pizzas with egg and eggless options. Prices start from ₹70 (delivery extra). Pre-order on WhatsApp for delivery across Chennai.',
  phone: '+91-8939411490',
  phoneDisplay: '+91 89394 11490',
  whatsapp: 'https://wa.me/918939411490',
  whatsappOrder:
    'https://wa.me/918939411490?text=Hello%20Desserty%20House%2C%20I%20would%20like%20to%20place%20an%20order.',
  email: 'dessertyhouse.official@gmail.com',
  instagram: 'https://www.instagram.com/dessertyhouse/',
  address: {
    // EDIT-ME: add your street address for stronger Local SEO (or keep locality-only for a home bakery)
    streetAddress: '',
    locality: 'Chennai',
    region: 'Tamil Nadu',
    postalCode: '600100',
    country: 'IN',
  },
  geo: {
    // EDIT-ME: your latitude/longitude (right-click your location in Google Maps → copy coordinates)
    latitude: 13.0827,
    longitude: 80.2707,
  },
  openingHours: [
    // Schema.org OpeningHoursSpecification — EDIT-ME to match your real hours
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '20:00' },
    { days: ['Sunday'], opens: '10:00', closes: '18:00' },
  ],
  priceRange: '₹70 onwards (made to order)',
  minPrice: 70,
  currency: 'INR',
  areaServed: ['Chennai', 'Tambaram', 'Velachery', 'Adyar', 'T. Nagar', 'Anna Nagar', 'OMR', 'Porur'],
  foundingYear: '2023', // EDIT-ME
  founder: 'Desserty House Team', // EDIT-ME: owner/baker name
  locale: 'en_IN',
} as const;

/** Absolute URL helper */
export const abs = (path: string) => `${site.url}${path.startsWith('/') ? path : `/${path}`}`;

/** Postal address as Schema.org object */
export const postalAddress = () => ({
  '@type': 'PostalAddress',
  ...(site.address.streetAddress ? { streetAddress: site.address.streetAddress } : {}),
  addressLocality: site.address.locality,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
});

/** Opening hours as Schema.org objects */
export const openingHoursSpec = () =>
  site.openingHours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }));

/** Full Bakery/LocalBusiness node reused across pages (stable @id for entity linking). */
export const bakerySchema = () => ({
  '@type': ['Bakery', 'LocalBusiness'],
  '@id': `${site.url}/#bakery`,
  name: site.name,
  alternateName: site.legalName,
  description: site.description,
  url: site.url,
  telephone: site.phone,
  email: site.email,
  image: [abs('/og-image.png')],
  logo: abs('/icons/icon-512.png'),
  priceRange: site.priceRange,
  currenciesAccepted: site.currency,
  paymentAccepted: 'UPI, Bank Transfer, Cash',
  servesCuisine: 'Bakery, Desserts, Cakes',
  address: postalAddress(),
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
  openingHoursSpecification: openingHoursSpec(),
  areaServed: site.areaServed.map((a) => ({ '@type': 'City', name: a })),
  sameAs: [site.instagram],
  hasMap: `https://www.google.com/maps/search/?api=1&query=${site.geo.latitude},${site.geo.longitude}`,
});

/** Organization node with stable @id */
export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: {
    '@type': 'ImageObject',
    '@id': `${site.url}/#logo`,
    url: abs('/icons/icon-512.png'),
    width: 512,
    height: 512,
    caption: `${site.name} logo`,
  },
  foundingDate: site.foundingYear,
  founder: { '@type': 'Person', name: site.founder },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: site.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Tamil'],
    },
  ],
  sameAs: [site.instagram],
});

/** WebSite node with SearchAction (sitelinks search box) */
export const webSiteSchema = () => ({
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  description: site.description,
  publisher: { '@id': `${site.url}/#organization` },
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/products?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

/** BreadcrumbList builder */
export const breadcrumbSchema = (items: { name: string; href: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.href),
  })),
});
