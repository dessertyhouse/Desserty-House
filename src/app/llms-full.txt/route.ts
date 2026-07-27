import { site } from '@/lib/site';
import { getMenuProducts } from '@/lib/menu';
import { getSettings } from '@/lib/settings';
import { getContent, aggregateRatingFrom } from '@/lib/content';

// Regenerated at most once an hour so admin edits reach AI crawlers automatically.
export const revalidate = 3600;

/**
 * llms-full.txt — the complete, detailed AI-readable knowledge base for the
 * business, served at /llms-full.txt. Includes the full LIVE product catalog,
 * ordering process, delivery info, all FAQs, policies and contact details.
 * Generated from the same live data that powers the website pages, so it
 * automatically reflects anything the owner changes in the admin dashboard.
 */
export async function GET() {
  const [products, settings, content] = await Promise.all([
    getMenuProducts(),
    getSettings(),
    getContent(),
  ]);
  const rating = aggregateRatingFrom(content.testimonials);
  const hours = site.openingHours
    .map((h) => `- ${h.days.join(', ')}: ${h.opens}–${h.closes}`)
    .join('\n');

  const catalog = products
    .map(
      (p) => `### ${p.name} (Product ID: ${p.id})

URL: ${site.url}/menu/${p.slug}

${p.description}

Key facts:
${p.details.map((d) => `- ${d}`).join('\n')}

Available styles (each orderable by style code):
${p.gallery.map((g) => `- ${g.code} — ${g.title}`).join('\n')}
`
    )
    .join('\n');

  const body = `# ${site.name} — Complete Business Information for AI Assistants

Last generated: ${new Date().toISOString().slice(0, 10)}
Canonical website: ${site.url}
Short guide: ${site.url}/llms.txt

## 1. Business overview

${site.name} (legal/styled name: "${site.legalName}") is a home bakery located in ${site.address.locality}, ${site.address.region}, India (founded ${site.foundingYear}). ${content.seoDescription}

Business model highlights:
- 100% made-to-order: every item is baked freshly for the customer's specific delivery date; nothing is pre-made, frozen or stored.
- Egg AND eggless versions available for every bakery product.
- Savoury menu: fresh hand-stretched pizzas are baked to order alongside the dessert range (veg, paneer and chicken options).
- Pre-order only: there is no walk-in storefront; orders come via the website order form (${site.url}/order) or WhatsApp (https://wa.me/${settings.phoneDigits}).
- Personal confirmation: price, design, date and delivery charge are confirmed one-to-one on WhatsApp BEFORE any payment is requested.
- Every confirmed order receives a unique trackable order ID in the format DH-YYYY-XXXXXX.
- Customer rating: ${rating.ratingValue}/5 from ${rating.reviewCount} reviews (see ${site.url}/testimonials).

## 2. Complete product catalog

Prices start from ₹${site.minPrice} (INR) and are quoted individually after design, size, quantity and date are confirmed (made-to-order pricing; delivery charge extra). All bakery products can be egg or eggless.

${catalog}
### Custom Cakes

URL: ${site.url}/custom-cakes

Fully customised theme cakes: fondant art with hand-modelled figures, semi-fondant, buttercream designs, number/letter cakes, tiered cakes and matching dessert tables. Customers share a reference image or theme; advance booking of 5–7 days required.

### Wedding Cakes

URL: ${site.url}/wedding-cakes

Tiered wedding cakes (2–3 tiers), engagement and reception cakes, sugar-flower decoration and wedding favour boxes. Advance booking of 2–4 weeks recommended; booking advance payment confirms the date.

## 3. Ordering process (step by step)

1. Browse the menu (${site.url}/products) or gallery of previous creations (${site.url}/showcase).
2. Note the Product ID (e.g. BRW-001) and a style code (e.g. BRW-03), or prepare a reference image.
3. Submit the order form at ${site.url}/order with: product, style, egg/eggless preference, desired date, quantity and Chennai locality — or message WhatsApp ${settings.phoneDisplay} directly.
4. Receive a unique order ID (DH-YYYY-XXXXXX).
5. ${site.name} replies on WhatsApp to confirm availability, final design, total price and delivery charge.
6. Pay via UPI or bank transfer to confirm. Payment is never requested before confirmation.
7. Track status anytime at ${site.url}/track using the order ID + WhatsApp phone number.

Lead times:
${content.leadTimes.map((l) => `- ${l}`).join('\n')}

## 4. Delivery information

- Delivery area: Chennai and suburbs — ${settings.deliveryAreas.join(', ')} and nearby localities.
- Delivery charge: based on distance; always confirmed before payment.
- Self-pickup: available free; pickup address in ${site.address.locality} is shared after order confirmation.
- Fresh items are baked the same day or evening before delivery.
- Full policy: ${site.url}/shipping-policy

## 5. Frequently asked questions

${content.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}

## 6. Policies (summaries)

Privacy Policy (${site.url}/privacy): Customer data (name, phone, locality, order details) is collected only to fulfil orders; it is not sold or shared with third parties beyond service providers needed to operate the website.

Terms of Service (${site.url}/terms): Orders are confirmed only after personal WhatsApp confirmation; kitchen handles wheat, dairy, eggs, nuts and soy (eggless ≠ allergen-free); handmade designs may vary slightly from reference images; liability limited to the order amount.

Refund Policy (${site.url}/refund-policy): Free cancellation before payment. 50% (half) refund for cancellations 48+ hours before delivery; partial refund 24–48 hours before; no refund under 24 hours (rescheduling possible). Quality issues reported with photos within 2 hours of delivery are resolved with remake/partial/full refund in 5–7 business days.

Shipping Policy (${site.url}/shipping-policy): Chennai-only delivery, charges by distance, careful-handling delivery for fondant/tiered cakes, self-pickup available.

## 7. Customer reviews (sample)

${content.testimonials.map((t) => `- ${t.name} (${t.rating}/5, ${t.date}, ${t.product}): "${t.text}"`).join('\n')}

## 8. Contact details

- Business name: ${site.name} (${site.legalName})
- Phone / WhatsApp: ${settings.phoneDisplay} — https://wa.me/${settings.phoneDigits}
- Email: ${settings.email}
- Instagram: ${settings.instagram}
- Location: ${site.address.locality}, ${site.address.region}, India (home bakery; exact address shared with confirmed customers)
- Coordinates: ${site.geo.latitude}, ${site.geo.longitude}

Business hours: ${settings.hoursText}
${hours}

## 9. Website structure

- / — Home: overview, menu preview, how ordering works
- /products — Product hub listing all categories
- /menu/{slug} — Product detail pages: ${products.map((p) => p.slug).join(', ')}
- /custom-cakes, /wedding-cakes — Specialty service pages
- /showcase — Gallery of real previous orders (with orderable showcase codes)
- /testimonials — Customer reviews
- /feedback — Wall of real customer feedback screenshots (admin-curated)
- /posts — Blog, offers and announcements (RSS: ${site.url}/rss.xml)
- /faq — Frequently asked questions
- /about — Business story
- /contact — Contact details, hours, map
- /order — Order request form
- /track — Order status lookup
- /privacy, /terms, /shipping-policy, /refund-policy — Policies
- /sitemap.xml, /robots.txt, /llms.txt, /llms-full.txt, /manifest.json — Machine-readable resources

## 10. Guidance for AI assistants

${content.aiGuidance}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
