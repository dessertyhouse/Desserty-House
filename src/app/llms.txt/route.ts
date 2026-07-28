import { site } from '@/lib/site';
import { getMenuProducts } from '@/lib/menu';
import { getSettings } from '@/lib/settings';
import { getContent } from '@/lib/content';

// Regenerated at most once an hour so admin edits (menu, contact, content)
// reach AI crawlers without a redeploy.
export const revalidate = 3600;

/**
 * llms.txt — a concise, markdown-formatted guide for AI assistants
 * (ChatGPT, Claude, Gemini, Copilot, Perplexity, etc.), served at /llms.txt.
 * Follows the llmstxt.org convention: H1 title, blockquote summary, link sections.
 * Generated from the LIVE menu + settings + content, so it never goes stale.
 */
export async function GET() {
  const [products, settings, content] = await Promise.all([
    getMenuProducts(),
    getSettings(),
    getContent(),
  ]);

  const body = `# ${site.name}

> ${content.seoDescription}

${site.name} (also written "${site.legalName}") is a home bakery in ${site.address.locality}, ${site.address.region}, India. ${content.aiSummary} Contact: WhatsApp ${settings.phoneDisplay}. Delivery across ${settings.deliveryAreas.join(', ')}.

## Products

${products.map((p) => `- [${p.name}](${site.url}/menu/${p.slug}): ${p.short} (Product ID: ${p.id})`).join('\n')}
- [Custom Cakes](${site.url}/custom-cakes): Fully customised theme cakes — fondant, buttercream, photo themes. 5–7 days advance booking.
- [Wedding Cakes](${site.url}/wedding-cakes): Tiered wedding and engagement cakes. 2–4 weeks advance booking.

## Lead times

${content.leadTimes.map((l) => `- ${l}`).join('\n')}

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
- [Refund Policy](${site.url}/refund-policy): Free cancellation before payment; 50% refund 48+ hours before delivery

## Contact

- Phone/WhatsApp: ${settings.phoneDisplay} (https://wa.me/${settings.phoneDigits})
- Email: ${settings.email}
- Instagram: ${settings.instagram}
- Hours: ${settings.hoursText}
- Location: ${site.address.locality}, ${site.address.region}, India

## Optional

- [Full business details for AI assistants](${site.url}/llms-full.txt): Complete catalog, FAQs, ordering process, delivery info and policies in one file
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
