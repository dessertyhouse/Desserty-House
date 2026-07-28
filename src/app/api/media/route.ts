import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { MANIFEST, CLOUD_NAME, DELIVERY_TX } from '@/app/cloudinary-manifest';

export const runtime = 'nodejs';
// Cache resolved redirects at the edge for a day; a missing image is retried sooner.
export const revalidate = 86400;

/**
 * Media fallback route.
 *
 * Most images now bypass this entirely: `media()` emits a direct
 * res.cloudinary.com URL from the build-time manifest. This route only handles
 * paths that are not yet in the manifest (e.g. uploaded after the last
 * `discover-cloudinary.mjs` run).
 *
 * Resolution order:
 *   1. Manifest hit                -> redirect immediately (no credentials needed)
 *   2. Cloudinary Admin API search -> resolve the random suffix, then redirect
 *   3. Give up                     -> 404 (NOT 503)
 *
 * Previously a Cloudinary credential problem made this route return 503 for
 * every asset, which took down every image on the site at once. Step 1 means a
 * credential outage can no longer do that.
 */

const allowed = [
  [/^\/collections\/([a-z-]+)\/([a-z-]+-\d+)\.jpg$/, 'selection'],
  [/^\/showcase\/real\/(dh-showcase-\d+)\.png$/, 'previous-orders'],
  [/^\/(hero-brownie-cake|fondant-showcase)\.png$/, 'site'],
] as const;

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function deliver(publicIdOrUrl: string) {
  const url = publicIdOrUrl.startsWith('http')
    ? publicIdOrUrl.replace('/upload/', `/upload/${DELIVERY_TX}/`)
    : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${DELIVERY_TX}/${publicIdOrUrl}`;
  return NextResponse.redirect(url, 307);
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '';

  // 1. Manifest — no network call, no credentials.
  const known = MANIFEST[path];
  if (known) return deliver(known);

  // Validate shape before touching the API.
  let folder = '';
  let name = '';
  let leaf = '';
  for (const [pattern, kind] of allowed) {
    const m = path.match(pattern);
    if (m) {
      folder = `Desserty House/${kind}${kind === 'selection' ? '/' + m[1] : ''}`;
      leaf = kind === 'selection' ? m[1] : kind;
      name = kind === 'selection' ? m[2] : m[1];
      break;
    }
  }
  if (!name) return new NextResponse('Unknown asset', { status: 404 });

  // 2. Admin API lookup. Only reachable when credentials are configured.
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return new NextResponse(
      'Image not in manifest and Cloudinary credentials are not configured. ' +
        'Run scripts/discover-cloudinary.mjs to regenerate the manifest.',
      { status: 404 }
    );
  }

  try {
    configure();
    let asset: { public_id: string; secure_url: string } | undefined;

    // Dynamic folders mean the asset may be indexed by asset_folder or sit at root.
    for (const f of [folder, folder.replace(/^Desserty House\//, ''), leaf]) {
      const r = await cloudinary.search
        .expression(`asset_folder="${f}"`)
        .max_results(500)
        .execute();
      asset = r.resources?.find(
        (x: { public_id: string }) =>
          x.public_id === name || x.public_id.startsWith(`${name}_`)
      );
      if (asset) break;
    }

    // Last resort: filename search across the whole account.
    if (!asset) {
      const r = await cloudinary.search
        .expression(`filename:${name}*`)
        .max_results(10)
        .execute();
      asset = r.resources?.[0];
    }

    if (!asset) return new NextResponse('Image not found', { status: 404 });
    return deliver(asset.secure_url);
  } catch {
    // Never log the error object — it has previously leaked the API secret.
    return new NextResponse('Image lookup failed', { status: 404 });
  }
}
