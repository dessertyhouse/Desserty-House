import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { products } from '@/app/products';
import { site, abs } from '@/lib/site';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Products — Cakes, Brownies, Cupcakes, Donuts & More',
  description:
    'Browse the full Desserty House menu: brownies, bento cakes, fondant cakes, birthday cakes, cupcakes, donuts and bomboloni. Egg & eggless, made to order in Chennai.',
  alternates: { canonical: '/products' },
  openGraph: { title: `Products | ${site.name}`, url: '/products' },
};

/** Product hub page with ItemList schema listing every product category. */
export const revalidate = 60;

export default async function Products() {
  const settings = await getSettings();
  const visibleProducts = products.filter((p) => !settings.hiddenProducts.includes(p.id));
  const itemList = {
    '@type': 'ItemList',
    name: `${site.name} product menu`,
    numberOfItems: visibleProducts.length,
    itemListElement: visibleProducts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: abs(`/menu/${p.slug}`),
    })),
  };
  return (
    <main>
      <JsonLd data={itemList} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Products', href: '/products' }]} />
      <section className="shell section">
        <p className="eyebrow">FULL MENU · MADE TO ORDER</p>
        <h1>Our products</h1>
        <p className="muted">
          Every item is baked to order in our Chennai home kitchen with egg and eggless options.
          Choose a category to see ten style references, then place your order online or on WhatsApp.
        </p>
        <div className="grid">
          {visibleProducts.map((p) => (
            <article className="card" key={p.id}>
              <img
                src={p.gallery[0].image}
                alt={`${p.name} — ${p.short}`}
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
              />
              <div>
                <div className="sku">PRODUCT ID · {p.id}</div>
                <h2>{p.name}</h2>
                <p className="muted">{p.short}</p>
                <Link className="text-link" href={`/menu/${p.slug}`}>See styles &amp; details →</Link>
                <br /><br />
                <Link className="btn" href={`/order?product=${p.id}`}>Order {p.name}</Link>
              </div>
            </article>
          ))}
        </div>
        <div className="notice" style={{ marginTop: '2rem' }}>
          Planning something special? See our <Link href="/custom-cakes">custom cakes</Link> and{' '}
          <Link href="/wedding-cakes">wedding cakes</Link> pages, or check{' '}
          <Link href="/faq">frequently asked questions</Link> about ordering and delivery.
        </div>
      </section>
    </main>
  );
}
