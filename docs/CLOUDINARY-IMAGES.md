# Cloudinary Images — How They Work Now

## TL;DR

Images are served **directly from `res.cloudinary.com`** using a lookup table at
`src/app/cloudinary-manifest.ts`.

**Before you deploy, run this once** to fill the table with all ~128 images:

```bash
CLOUDINARY_CLOUD_NAME=pjn0251d \
CLOUDINARY_API_KEY=your_key \
CLOUDINARY_API_SECRET=your_secret \
node scripts/discover-cloudinary.mjs --verify
```

Then commit the regenerated `src/app/cloudinary-manifest.ts` and deploy.

---

## What was broken

Every image on the live site was returning **HTTP 503**. Verified on
`desserty-house.vercel.app`:

```
/api/media?path=%2Fcollections%2Fbrownies%2Fbrownies-1.jpg   503
/api/media?path=%2Fshowcase%2Freal%2Fdh-showcase-46.png      503
/api/media?path=%2Fhero-brownie-cake.png                     503
```

Every product photo, all 46 showcase photos and the hero were blank in a real browser.

**Root cause.** `media()` routed *every* image through the `/api/media` serverless
route. That route calls the Cloudinary **Admin API**, which needs
`CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`. Those credentials are failing on the
deployment — consistent with `handover.md`, which records that the API secret leaked
into Vercel logs and **had to be rotated**. When the lookup throws, the old code
returned `503` for every asset. One credential problem blanked the entire site.

The images themselves were never lost. The same assets respond `200` when addressed
directly:

```
https://res.cloudinary.com/pjn0251d/image/upload/bomboloni-9_nptmpo      200
https://res.cloudinary.com/pjn0251d/image/upload/bento-9_c6kezf          200
https://res.cloudinary.com/pjn0251d/image/upload/dh-showcase-46_ehsejs   200
```

## Why a lookup table is required

Cloudinary appends a random 6-character suffix on upload:

```
bomboloni-9.jpg   ->   public_id: bomboloni-9_nptmpo
bento-9.jpg       ->   public_id: bento-9_c6kezf
```

The suffix is **not derivable** from the filename, so a URL cannot be constructed
from the path alone. Confirmed by testing: `bomboloni-9.webp`, `bomboloni-8_nptmpo`
and `brownies-1.jpg` all return 404. The manifest captures the real IDs once, at
build time, instead of paying an authenticated API call per request.

### Folder note

This account uses Cloudinary **dynamic folders**. The Media Library displays
`Desserty House/selection/bento/`, but the delivery public_id is at the **root**:

```
/image/upload/bento-9_c6kezf                             200
/image/upload/Desserty%20House/selection/bento/bento-9_c6kezf   404
```

Manifest entries are therefore bare public_ids with no folder prefix.

## How resolution works

`media(path)` in `src/app/media.ts`:

1. **Manifest hit** → direct `res.cloudinary.com` URL. No serverless call, no
   redirect, no credentials.
2. **Miss** → falls back to `/api/media`, which resolves the suffix server-side.

The fallback route was also hardened: it now checks the manifest first, tries a
filename search as a last resort, and returns **404 instead of 503** on failure, so a
credential outage can never again take down every image at once.

## Currently in the manifest

Three entries are pre-verified (HTTP 200). The other ~125 need the discovery script,
because their random suffixes can only be read from your account:

| Path | public_id |
|---|---|
| `/collections/bomboloni/bomboloni-9.jpg` | `bomboloni-9_nptmpo` |
| `/collections/bento/bento-9.jpg` | `bento-9_c6kezf` |
| `/showcase/real/dh-showcase-46.png` | `dh-showcase-46_ehsejs` |

Anything not listed keeps using the fallback route, so nothing hard-fails.

## Running the discovery script

```bash
node scripts/discover-cloudinary.mjs           # write the manifest
node scripts/discover-cloudinary.mjs --dry     # preview, don't write
node scripts/discover-cloudinary.mjs --verify  # write, then HEAD every URL
```

It pages through every asset, matches each to the path the site requests, and
rewrites the manifest grouped by section. Anything it cannot find is listed as a
commented `NOT FOUND` line — those are images genuinely absent from Cloudinary
(the `pizza` folder was still empty per `docs/PIZZA-IMAGES-UPLOAD.md`).

The API secret is read from the environment only. It is never written to disk or
printed.

Re-run it whenever you upload, rename or replace images.

## Getting credentials

Cloudinary Console → **Settings → API Keys**. Given the logged leak recorded in
`handover.md`, generate a **fresh key pair** and update Vercel:

```
CLOUDINARY_CLOUD_NAME    = pjn0251d
CLOUDINARY_API_KEY       = (new)
CLOUDINARY_API_SECRET    = (new)
```

Once the manifest is populated, the public site renders images **without** these
credentials — they are only needed for the discovery script and admin uploads.
