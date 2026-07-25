import Link from 'next/link';
import type { Metadata } from 'next';
import { products } from '@/app/products';
import { media } from '@/app/media';
import { site } from '@/lib/site';
import { getSettings, waOrderLink } from '@/lib/settings';

export const metadata: Metadata = {
  title: `${site.name} | Home Bakery in Chennai — Cakes, Brownies & Fondant Art`,
  description:
    'Order handmade brownies, bento cakes, custom birthday cakes, fondant cakes, cupcakes, donuts and bomboloni in Chennai. Egg and eggless options. Pre-order on WhatsApp.',
  alternates: { canonical: '/' },
};

export const revalidate = 60;

export default async function Home() {
  const settings = await getSettings();
  const visibleProducts = products.filter((p) => !settings.hiddenProducts.includes(p.id));
  const wa = waOrderLink(settings);
  return (
    <main>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg,#26130ddd 30%,#26130d55),url("${media('/hero-brownie-cake.png')}")`,
        }}
      >
        <div className="shell">
          <p className="eyebrow">BROWNIES · CAKES · FONDANT ART</p>
          <h1>{settings.heroTitle || 'Handmade cakes & brownies in Chennai, made for the sweetest moments.'}</h1>
          <p className="lead">
            {settings.heroSubtitle ||
              `Fresh brownies, bento cakes, birthday cakes and hand-crafted fondant creations — made to order by ${site.name}, a home bakery in Chennai. Choose egg or eggless for your celebration.`}
          </p>
          <div className="hero-actions">
            <Link className="btn gold" href="/products">Explore the menu</Link>
            <a className="hero-text-link" href={wa} rel="noopener">Talk to us on WhatsApp →</a>
          </div>
          <div className="trust-row">
            <span>✦ Egg &amp; eggless choices</span>
            <span>✦ Made to order</span>
            <span>✦ Chennai delivery</span>
          </div>
        </div>
      </section>

      <section className="shell section menu-section" id="menu">
        <p className="eyebrow">OUR MADE-TO-ORDER MENU</p>
        <h2>Choose your sweet moment.</h2>
        <p className="muted">
          Prices are shared after we confirm your design, quantity and date. Delivery is charged
          separately based on your location — see our <Link href="/shipping-policy">delivery policy</Link>.
        </p>
        <div className="grid">
          {visibleProducts.map((p) => (
            <article className="card" key={p.id}>
              <img
                src={p.gallery[0].image}
                alt={`${p.name} by ${site.name}, home bakery in Chennai — ${p.short}`}
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
              />
              <div>
                <div className="sku">PRODUCT ID · {p.id}</div>
                <h3>{p.name}</h3>
                <p className="muted">{p.short}</p>
                <Link className="text-link" href={`/menu/${p.slug}`}>See styles &amp; details →</Link>
                <br /><br />
                <Link className="btn" href={`/order?product=${p.id}`}>Order {p.name}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section how-section">
        <p className="eyebrow">SIMPLE, PERSONALISED ORDERING</p>
        <h2>From idea to celebration.</h2>
        <div className="how-grid">
          <div>
            <b>01</b>
            <h3>Choose a style</h3>
            <p>Explore our <Link href="/products">menu</Link> or use a <Link href="/showcase">previous order</Link> as your inspiration.</p>
          </div>
          <div>
            <b>02</b>
            <h3>Share your details</h3>
            <p>Tell us your date, quantity, egg preference and Chennai locality on the <Link href="/order">order form</Link>.</p>
          </div>
          <div>
            <b>03</b>
            <h3>Confirm on WhatsApp</h3>
            <p>We confirm availability, customisation, quote and delivery charge personally.</p>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="notice">
          <b>Custom fondant and wedding cakes need advance booking.</b>
          <br />
          Send your celebration date, serving count and inspiration image. We confirm availability
          and quote personally on WhatsApp. Learn more on our{' '}
          <Link href="/custom-cakes">custom cakes</Link> and <Link href="/wedding-cakes">wedding cakes</Link> pages.
        </div>
      </section>

      <section className="shell section">
        <div className="notice">
          <p className="eyebrow">REAL DESSERTY HOUSE CREATIONS</p>
          <h2>Looking for inspiration?</h2>
          <p>
            Explore genuine previous customer orders — brownies, bento cakes, donuts, birthday cakes
            and more — or read what customers say on our <Link href="/testimonials">testimonials page</Link>.
          </p>
          <Link className="btn gold" href="/showcase">View previous orders →</Link>
        </div>
      </section>
    </main>
  );
}
