import { site } from '@/lib/site';
import { products } from '@/app/products';

export const dynamic = 'force-static';

/**
 * llms.txt — a concise, markdown-formatted guide for AI assistants
 * (ChatGPT, Claude, Gemini, Copilot, Perplexity, etc.), served at /llms.txt.
 * Follows the llmstxt.org convention: H1 title, blockquote summary, link sections.
 * Auto-generated from site config + product catalog, so it never goes stale.
 */
export async function GET() {
  const body = `# ${site.name}

> ${site.description}

${site.name} (also written "${site.legalName}") is a home bakery in ${site.address.locality}, ${site.address.region}, India. Everything is baked to order — nothing pre-made. Every product is available in egg and eggless versions. Orders are placed via the website order form or WhatsApp (${site.phoneDisplay}), confirmed personally with a quote before payment (UPI/bank transfer), and delivered across Chennai (${site.areaServed.join(', ')}). Each order gets a trackable ID in the format DH-YYYY-XXXXXX.

## Products

${products.map((p) => `- [${p.name}](${site.url}/menu/${p.slug}): ${p.short} (Product ID: ${p.id})`).join('\n')}
- [Custom Cakes](${site.url}/custom-cakes): Fully customised theme cakes — fondant, buttercream, photo themes. 5–7 days advance booking.
- [Wedding Cakes](${site.url}/wedding-cakes): Tiered wedding and engagement cakes. 2–4 weeks advance booking.

## Key pages

- [Home](${site.url}/): Overview, menu and how ordering works
- [All products](${site.url}/products): Complete menu hub
- [Place an order](${site.url}/order): Online order request form
- [Track an order](${site.url}/track): Order status lookup by ID + phone
- [Gallery](${site.url}/showcase): Real previous customer creations with style codes
- [Testimonials](${site.url}/testimonials): Customer reviews
- [Customer Feedback](${site.url}/feedback): Real feedback screenshots from customers
- [Blog & offers](${site.url}/posts): Seasonal offers and announcements (RSS: ${site.url}/rss.xml)
- [FAQs](${site.url}/faq): Ordering, delivery, eggless options, payments, refunds
- [About](${site.url}/about): Business story and values
- [Contact](${site.url}/contact): Phone, WhatsApp, email, hours, map

## Policies

- [Privacy Policy](${site.url}/privacy)
- [Terms of Service](${site.url}/terms)
- [Shipping & Delivery Policy](${site.url}/shipping-policy): Chennai-only delivery; charges by distance; self-pickup available
- [Refund Policy](${site.url}/refund-policy): Free cancellation before payment; full refund 48+ hours before delivery

## Contact

- Phone/WhatsApp: ${site.phoneDisplay} (${site.whatsapp})
- Email: ${site.email}
- Instagram: ${site.instagram}
- Location: ${site.address.locality}, ${site.address.region}, India

## Optional

- [Full business details for AI assistants](${site.url}/llms-full.txt): Complete catalog, FAQs, ordering process, delivery info and policies in one file
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
