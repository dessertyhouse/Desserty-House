/**
 * Cloudinary asset manifest — logical site path → Cloudinary public_id.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Cloudinary appends a random 6-character suffix on upload (`unique_filename`),
 * so `bomboloni-9.jpg` is stored as public_id `bomboloni-9_nptmpo`. The suffix
 * is not derivable from the filename, so a lookup table is the only way to
 * build a direct delivery URL without calling the authenticated Admin API on
 * every request.
 *
 * Assets in this account use Cloudinary "dynamic folders": the Media Library
 * shows them under `Desserty House/selection/...`, but the delivery public_id
 * lives at the ROOT of the namespace. Verified:
 *   https://res.cloudinary.com/pjn0251d/image/upload/bomboloni-9_nptmpo  -> 200
 *   .../upload/Desserty%20House/selection/bento/bento-9_c6kezf           -> 404
 * So entries below are bare public_ids with NO folder prefix.
 *
 * HOW TO FILL THIS IN (one command)
 * ---------------------------------
 *   CLOUDINARY_CLOUD_NAME=pjn0251d \
 *   CLOUDINARY_API_KEY=xxx \
 *   CLOUDINARY_API_SECRET=yyy \
 *   node scripts/discover-cloudinary.mjs
 *
 * That script lists every asset in the account and rewrites the MANIFEST
 * constant below. Re-run it whenever you upload or rename images.
 *
 * Any path missing from the manifest automatically falls back to the
 * `/api/media` lookup route, so the site never hard-fails.
 */

/** logical path (as passed to `media()`) → Cloudinary public_id */
export const MANIFEST: Record<string, string> = {
  // ---- verified live (HTTP 200) -------------------------------------------
  '/collections/bomboloni/bomboloni-9.jpg': 'bomboloni-9_nptmpo',
  '/collections/bento/bento-9.jpg': 'bento-9_c6kezf',
  '/showcase/real/dh-showcase-46.png': 'dh-showcase-46_ehsejs',

  // ---- run scripts/discover-cloudinary.mjs to append the rest -------------
};

/** Cloudinary cloud name. Public, safe to ship — it appears in every image URL. */
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'pjn0251d';

/**
 * Delivery transformation.
 * f_auto  – best format per browser (AVIF/WebP)
 * q_auto  – perceptual quality compression
 * dpr_auto– retina-aware
 * Width is NOT pinned here so one URL serves every layout; add `w_` per call
 * site if you later want tighter art direction.
 */
export const DELIVERY_TX = 'f_auto,q_auto,dpr_auto';

/** Build a direct Cloudinary delivery URL for a known public_id. */
export function cloudinaryUrl(publicId: string, tx: string = DELIVERY_TX): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${tx}/${publicId}`;
}
