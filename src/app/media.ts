import { MANIFEST, CLOUD_NAME, cloudinaryUrl } from './cloudinary-manifest';

/**
 * Resolve a logical image path to a delivery URL.
 *
 * Preferred path: the asset is in `cloudinary-manifest.ts`, so we emit a
 * DIRECT `res.cloudinary.com` URL. That means no serverless invocation, no
 * redirect hop, no Cloudinary Admin API call, and no dependency on
 * CLOUDINARY_API_KEY/SECRET being present at runtime.
 *
 * Fallback path: unknown asset (e.g. freshly uploaded, manifest not yet
 * regenerated) falls back to the `/api/media` lookup route, which resolves the
 * suffix server-side. Slower and needs credentials, but keeps the site working.
 *
 * The previous implementation sent EVERY image through `/api/media`. When the
 * Cloudinary credentials on the deployment stopped working, that route began
 * returning 503 and every product, showcase and hero image on the live site
 * broke at once. Going direct removes that single point of failure.
 */
export function media(path: string): string {
  const publicId = MANIFEST[path];
  if (publicId) return cloudinaryUrl(publicId);
  return `/api/media?path=${encodeURIComponent(path)}`;
}

/** True when `path` resolves to a direct Cloudinary URL (i.e. it's in the manifest). */
export function isDirect(path: string): boolean {
  return Boolean(MANIFEST[path]);
}

/* ---------------------------------------------------------------------------
 * Responsive delivery helpers
 *
 * Cards render at ~360px on desktop and ~350px on phones, but the browser was
 * downloading the full-size original for every one of them. Cloudinary can
 * resize on the fly, so we hand the browser a srcset and let it pick.
 *
 * These helpers only produce a srcset for assets we can address directly.
 * Anything still going through /api/media returns undefined, and the <img>
 * simply behaves exactly as it does today — no breakage during migration.
 * ------------------------------------------------------------------------- */

/** Widths generated for responsive candidates. Covers 1x and 2x for our layouts. */
const CARD_WIDTHS = [320, 480, 640, 960, 1280] as const;

/** Cloudinary transformation used for every responsive candidate. */
function tx(width: number, extra = '') {
  return `f_auto,q_auto,c_fill,g_auto,w_${width}${extra ? ',' + extra : ''}`;
}

/**
 * Build a `srcset` for a manifest-backed image.
 * Returns undefined when the asset is not directly addressable.
 */
export function mediaSrcSet(path: string, widths: readonly number[] = CARD_WIDTHS): string | undefined {
  const publicId = MANIFEST[path];
  if (!publicId) return undefined;
  return widths
    .map((w) => `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${tx(w)}/${publicId} ${w}w`)
    .join(', ');
}

/**
 * Everything an <img> needs for fast, correctly-sized delivery.
 *
 * Usage:
 *   <img {...mediaImg('/collections/brownies/brownies-1.jpg', '(max-width:700px) 100vw, 360px')} />
 *
 * Falls back to a plain `src` when the asset isn't in the manifest yet.
 */
export function mediaImg(
  path: string,
  sizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px',
  widths: readonly number[] = CARD_WIDTHS
): { src: string; srcSet?: string; sizes?: string } {
  const srcSet = mediaSrcSet(path, widths);
  return srcSet ? { src: media(path), srcSet, sizes } : { src: media(path) };
}

/**
 * A tiny, heavily-blurred inline placeholder URL for progressive loading.
 * Cloudinary renders it at 24px wide, so it arrives almost instantly.
 */
export function mediaBlur(path: string): string | undefined {
  const publicId = MANIFEST[path];
  if (!publicId) return undefined;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto:low,w_24,e_blur:200/${publicId}`;
}

/* ---------------------------------------------------------------------------
 * URL-based responsive helpers
 *
 * Product, showcase and admin-uploaded records already store a fully-resolved
 * URL (via `media()` at build time, or Cloudinary's `secure_url` for uploads).
 * These helpers add a srcset to an EXISTING url without touching any data
 * model, so admin-uploaded images get the same treatment as built-in ones.
 * ------------------------------------------------------------------------- */

/** Any Cloudinary delivery URL, capturing the transform slot and the public id. */
const CLD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:([^/]*)\/)?(v\d+\/)?(.+)$/;

/** True for a direct Cloudinary delivery URL we can safely transform. */
export function isCloudinaryUrl(url: string): boolean {
  return typeof url === 'string' && CLD_RE.test(url);
}

/**
 * Build a `srcset` from an existing Cloudinary URL by swapping in width
 * transforms. Returns undefined for non-Cloudinary URLs (e.g. `/api/media`
 * fallbacks), in which case the caller just omits the attribute.
 */
export function srcSetFromUrl(url: string, widths: readonly number[] = CARD_WIDTHS): string | undefined {
  const m = typeof url === 'string' ? url.match(CLD_RE) : null;
  if (!m) return undefined;
  const [, base, , version, id] = m;
  return widths
    .map((w) => `${base}${tx(w)}/${version || ''}${id} ${w}w`)
    .join(', ');
}

/**
 * Spread-ready responsive attributes for an already-resolved image URL.
 *
 *   <img {...imgAttrs(item.image)} alt="…" loading="lazy" />
 *
 * Non-Cloudinary URLs pass through unchanged, so nothing breaks while the
 * manifest is still being populated.
 */
export function imgAttrs(
  url: string,
  sizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px',
  widths: readonly number[] = CARD_WIDTHS
): { src: string; srcSet?: string; sizes?: string } {
  const srcSet = srcSetFromUrl(url, widths);
  return srcSet ? { src: url, srcSet, sizes } : { src: url };
}
