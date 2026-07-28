import Link from 'next/link';
import type { Metadata } from 'next';
import { media } from '@/app/media';
import { site } from '@/lib/site';
import { getSettings, waOrderLink } from '@/lib/settings';
import { getMenuProducts } from '@/lib/menu';
import { getContent } from '@/lib/content';
import {
  NamedIcon,
  ProductIcon,
  IconArrowRight,
  IconWhatsApp,
  IconSparkle,
  IconGrid,
  IconHeart,
} from '@/components/Icons';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: `${site.name} | Home Bakery in Chennai — Cakes, Brownies, Fondant Art & Pizza`,
    description: content.seoDescription.slice(0, 158),
    alternates: { canonical: '/' },
  };
}

export const revalidate = 60;

export default async function Home() {
  const [settings, visibleProducts, content] = await Promise.all([
    getSettings(),
    getMenuProducts(),
    getContent(),
  ]);
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
          <p className="eyebrow">BROWNIES · CAKES · FONDANT ART · PIZZA</p>
          <h1>{settings.heroTitle || 'Handmade cakes & brownies in Chennai, made for the sweetest moments.'}</h1>
          <p className="lead">
            {settings.heroSubtitle ||
              `Fresh brownies, bento cakes, birthday cakes, hand-crafted fondant creations and stone-fresh pizzas — made to order by ${site.name}, a home bakery in Chennai. Choose egg or eggless for your celebration.`}
          </p>
          <div className="hero-actions">
            <Link className="btn gold" href="/products">
              Explore the menu
            </Link>
            <a className="hero-text-link icon-inline" href={wa} rel="noopener">
              Talk to us on WhatsApp <IconArrowRight size={17} />
            </a>
          </div>
          {/* Trust badges: a real list, wrapping pills, never clipped by the fold */}
          <ul className="trust-row">
            {content.trustBadges.map((b) => (
              <li key={b.label}>
                <NamedIcon name={b.icon} size={17} />
                {b.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell section menu-section" id="menu">
        <p className="eyebrow">OUR MADE-TO-ORDER MENU</p>
        <div className="section-title-row">
          <IconGrid size={26} className="section-icon" />
          <h2>{content.menuHeading}</h2>
        </div>
        <p className="muted">
          {content.menuIntro} See our <Link href="/shipping-policy">delivery policy</Link>.
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
                <div className="card-title-row">
                  <span className="card-icon">
                    <ProductIcon slug={p.slug} size={20} />
                  </span>
                  <h3>{p.name}</h3>
                </div>
                <p className="muted">{p.short}</p>
                <Link className="text-link" href={`/menu/${p.slug}`}>
                  See styles &amp; details <IconArrowRight size={16} />
                </Link>
                <br />
                <br />
                <Link className="btn" href={`/order?product=${p.id}`}>
                  Order {p.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section how-section">
        <p className="eyebrow">SIMPLE, PERSONALISED ORDERING</p>
        <h2>{content.howHeading}</h2>
        <div className="how-grid">
          {content.howSteps.map((step, i) => (
            <div key={step.title}>
              <div className="step-head">
                <span className="step-icon">
                  <NamedIcon name={step.icon} size={18} />
                </span>
                <span className="step-num">STEP {String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 18 }}>
          Start with the <Link href="/products">menu</Link>, take inspiration from a{' '}
          <Link href="/showcase">previous order</Link>, then send details on the{' '}
          <Link href="/order">order form</Link>.
        </p>
      </section>

      <section className="shell section">
        <div className="notice">
          <b>Custom fondant and wedding cakes need advance booking.</b>
          <br />
          Send your celebration date, serving count and inspiration image. We confirm availability
          and quote personally on WhatsApp. Learn more on our{' '}
          <Link href="/custom-cakes">custom cakes</Link> and{' '}
          <Link href="/wedding-cakes">wedding cakes</Link> pages.
        </div>
      </section>

      <section className="shell section">
        <div className="notice">
          <p className="eyebrow">REAL DESSERTY HOUSE CREATIONS</p>
          <div className="section-title-row">
            <IconHeart size={24} className="section-icon" />
            <h2>Looking for inspiration?</h2>
          </div>
          <p>
            Explore genuine previous customer orders — brownies, bento cakes, donuts, birthday cakes
            and more — or read what customers say on our{' '}
            <Link href="/testimonials">testimonials page</Link>.
          </p>
          <Link className="btn gold icon-right" href="/showcase">
            View previous orders <IconArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="shell section">
        <div className="notice">
          <p className="eyebrow">
            <IconSparkle size={14} /> READY WHEN YOU ARE
          </p>
          <h2>Order in under a minute.</h2>
          <p>
            Message us with your date, quantity and idea — we reply with availability, a quote and
            the delivery charge before you pay anything.
          </p>
          <a className="btn gold" href={wa} rel="noopener">
            <IconWhatsApp size={18} /> Order on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
