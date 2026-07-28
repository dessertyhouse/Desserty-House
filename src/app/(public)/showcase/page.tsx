import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getGalleryItems } from '@/lib/gallery';
import { site, abs } from '@/lib/site';
import { IconArrowRight, IconExternal } from '@/components/Icons';
import ItemLinks from '@/components/ItemLinks';

export const metadata: Metadata = {
  title: 'Gallery — Real Previous Orders & Creations',
  description:
    'Browse genuine previous Desserty House creations in Chennai: brownies, bento cakes, birthday cakes, fondant cakes, cupcakes and donuts made for real customers.',
  alternates: { canonical: '/showcase' },
  openGraph: { title: `Gallery | ${site.name}`, url: '/showcase' },
};

/** Gallery page with ImageGallery + ImageObject JSON-LD for image SEO.
 *  Items come from src/lib/gallery.ts, so anything the admin edits, hides or
 *  uploads in the Gallery tab shows up here within about a minute. */
export const revalidate = 60;

export default async function Showcase() {
  const showcase = await getGalleryItems();
  const gallerySchema = {
    '@type': 'ImageGallery',
    '@id': abs('/showcase#gallery'),
    name: `${site.name} — previous customer creations`,
    url: abs('/showcase'),
    about: { '@id': `${site.url}/#bakery` },
    image: showcase.slice(0, 30).map((item) => ({
      '@type': 'ImageObject',
      contentUrl: abs(item.image),
      name: item.title,
      description: item.description,
      creator: { '@id': `${site.url}/#organization` },
    })),
  };
  return (
    <main>
      <JsonLd data={gallerySchema} />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Gallery', href: '/showcase' }]} />
      <section className="showcase-hero">
        <div className="shell">
          <p className="eyebrow">REAL CUSTOMER CREATIONS</p>
          <h1>Gallery of previous orders</h1>
          <p>
            Browse a selection of {site.legalName}&apos;s previous orders. See something you love? Note
            its showcase code and share it when you <Link href="/order">order</Link> — or tap through
            to our Instagram for more.
          </p>
        </div>
      </section>
      <section className="shell section">
        <div className="notice">
          <b>How to use this gallery:</b> Choose a showcase style, note its code, then send us your
          date, quantity, egg/eggless preference and customisation idea. Every celebration is made
          to order — see the <Link href="/faq">FAQs</Link> for lead times.
        </div>
        <div className="showcase-grid">
          {showcase.map((item) => (
            <article className="showcase-card" key={item.code}>
              <img
                src={item.image}
                alt={`${item.title} — ${item.category} previous order by ${site.name} Chennai`}
                loading="lazy"
                decoding="async"
                width={400}
                height={400}
              />
              <div>
                <span className="sku">{item.code} · {item.category}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <ItemLinks links={item.links} />
                <div className="card-links">
                  <Link href={`/order?showcase=${item.code}`}>
                    Order a similar style <IconArrowRight size={14} />
                  </Link>
                  <a href={item.instagram} target="_blank" rel="noopener">
                    View Instagram <IconExternal size={13} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
