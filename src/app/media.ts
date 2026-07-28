import { MANIFEST, cloudinaryUrl } from './cloudinary-manifest';

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
