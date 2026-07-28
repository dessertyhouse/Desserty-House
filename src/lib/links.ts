/**
 * Shared helpers for admin-supplied links on posts, feedback and gallery items.
 *
 * The owner can paste any URL, so everything is sanitised before it is stored
 * and before it is rendered. Only safe schemes are allowed:
 *   - https:// and http://   (external pages)
 *   - mailto: and tel:       (contact links)
 *   - /internal/paths        (pages on this site)
 *
 * Anything else — most importantly `javascript:` and `data:` — is rejected,
 * which prevents a stored-XSS hole via the admin panel.
 */

export type ItemLink = {
  url: string;
  label: string;
};

const SAFE_SCHEMES = ['https://', 'http://', 'mailto:', 'tel:'];

/**
 * Clean a single URL. Returns '' when the value is unusable, so callers can
 * simply drop falsy results.
 */
export function sanitiseUrl(input: unknown): string {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  // Reject control characters and whitespace tricks used to smuggle schemes
  if (/[\u0000-\u001F\u007F]/.test(raw)) return '';

  const lower = raw.toLowerCase().replace(/\s+/g, '');
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return '';
  }

  // Internal link
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw.slice(0, 400);

  // Known-safe scheme
  if (SAFE_SCHEMES.some((s) => lower.startsWith(s))) return raw.slice(0, 400);

  // Bare domain like "instagram.com/dessertyhouse" — assume https
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/|$)/i.test(raw)) {
    return `https://${raw}`.slice(0, 400);
  }

  return '';
}

/** Clean a { url, label } pair. Returns null when there is no usable link. */
export function sanitiseLink(url: unknown, label: unknown): ItemLink | null {
  const clean = sanitiseUrl(url);
  if (!clean) return null;
  const text = String(label ?? '').trim().slice(0, 60);
  return { url: clean, label: text || defaultLabel(clean) };
}

/** A sensible button label when the admin does not supply one. */
export function defaultLabel(url: string): string {
  const u = url.toLowerCase();
  if (u.startsWith('mailto:')) return 'Email us';
  if (u.startsWith('tel:')) return 'Call us';
  if (u.includes('wa.me') || u.includes('whatsapp')) return 'Message on WhatsApp';
  if (u.includes('instagram.com')) return 'View on Instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'Watch the video';
  if (u.includes('facebook.com')) return 'View on Facebook';
  if (u.startsWith('/order')) return 'Order this';
  if (u.startsWith('/')) return 'Read more';
  return 'Open link';
}

/** True when the link leaves this website (so we add target/rel). */
export function isExternal(url: string): boolean {
  return /^(https?:)?\/\//i.test(url) || /^(mailto:|tel:)/i.test(url);
}
