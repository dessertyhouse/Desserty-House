import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { products } from '@/app/products';
import { getMenuProduct, getMenuProducts } from '@/lib/menu';
import { site, abs } from '@/lib/site';
import { getContent, aggregateRatingFrom } from '@/lib/content';
import { ProductIcon, IconArrowRight, IconCheckCircle, IconInfo } from '@/components/Icons';

// Pre-render built-in product pages; custom admin-added products are rendered
// on demand (dynamicParams) and cached for 60 seconds.
export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getMenuProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} in Chennai — Egg & Eggless, Made to Order`,
    description: `${p.short} ${p.description}`.slice(0, 158),
    alternates: { canonical: `/menu/${p.slug}` },
    openGraph: {
      title: `${p.name} | ${site.name}`,
      description: p.short,
      url: `/menu/${p.slug}`,
      images: [{ url: p.gallery[0].image, alt: `${p.name} by ${site.name}` }],
    },
  };
}

/** Product page with full Product + Offer + AggregateRating + ImageObject JSON-LD. */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, allProducts, content] = await Promise.all([
    getMenuProduct(slug),
    getMenuProducts(),
    getContent(),
  ]);
  if (!p) return notFound();

  const rating = aggregateRatingFrom(content.testimonials);
  const related = allProducts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const productSchema = {
    '@type': 'Product',
    '@id': abs(`/menu/${p.slug}#product`),
    name: `${p.name} — ${site.name}`,
    sku: p.id,
    description: p.description,
    category: 'Bakery products',
    image: p.gallery.map((g) => ({
      '@type': 'ImageObject',
      contentUrl: abs(g.image),
      name: `${p.name} — ${g.title}`,
      description: g.description,
    })),
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      url: abs(`/order?product=${p.id}`),
      priceCurrency: site.currency,
      // Made-to-order: prices start at ₹70; exact quote after design/quantity confirmation
      price: '70',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: site.currency,
        minPrice: 70,
        description: 'Prices start from ₹70 (delivery extra). Exact quote confirmed on WhatsApp after design, quantity and date.',
      },
      availability: 'https://schema.org/PreOrder',
      areaServed: site.areaServed.map((a) => ({ '@type': 'City', name: a })),
      seller: { '@id': `${site.url}/#organization` },
    },
    ...(rating.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.ratingValue,
            reviewCount: rating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: p.name, href: `/menu/${p.slug}` },
  ];

  return (
    <main>
      <JsonLd data={productSchema} />
      <Breadcrumbs items={crumbs} />
      <section className="shell section">
        <p className="eyebrow">{p.id} · MADE TO ORDER</p>
        <div className="section-title-row">
          <ProductIcon slug={p.slug} size={30} className="section-icon" />
          <h1>{p.name} — handmade in Chennai</h1>
        </div>
        <p className="product-intro">{p.description}</p>
        <div className="photo-grid">
          {p.gallery.map((style) => (
            <div className="style-card" key={style.code}>
              <img
                src={style.image}
                alt={`${p.name} style ${style.code} — ${style.title}, handmade by ${site.name} Chennai`}
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
              />
              <div>
                <b>{style.code} · {style.title}</b>
                <p>{style.description}</p>
                <Link className="text-link" href={`/order?product=${p.id}&style=${style.code}`}>
                  Order this style <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="product-info">
          <div>
            <h2>Made for your moment</h2>
            <ul className="feature-list">
              {p.details.map((x) => (
                <li key={x}>
                  <IconCheckCircle size={18} />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <p>
              Explore related treats:{' '}
              {related.map((x, i) => (
                <span key={x.slug}>
                  {i > 0 && ' · '}
                  <Link href={`/menu/${x.slug}`}>{x.name}</Link>
                </span>
              ))}
              {' '}· <Link href="/custom-cakes">Custom cakes</Link>
            </p>
          </div>
          <aside>
            <b className="icon-inline"><IconInfo size={16} /> How to order</b>
            <p>
              Choose this item, send your date, quantity and preference. We confirm availability,
              quote and delivery charge personally on WhatsApp. See{' '}
              <Link href="/faq">FAQs</Link> and <Link href="/shipping-policy">delivery info</Link>.
            </p>
            <Link className="btn gold icon-right" href={`/order?product=${p.id}`}>
              Request {p.name} <IconArrowRight size={17} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
