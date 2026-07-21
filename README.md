# Dessert(y) House — website and order workflow

A clean replacement for the old unrelated repository. It provides a public menu with fixed product IDs, an order-request form, WhatsApp hand-off, customer order lookup, and a one-owner order/follow-up dashboard.

## What is deliberately included
- Products: Brownies (`BRW-001`), Bento Cakes (`BEN-001`), Fondant Cakes (`FON-001`), Bomboloni (`BOM-001`), Cupcakes (`CUP-001`), Donuts (`DON-001`), Birthday Cakes (`BDY-001`).
- Customer selects egg/eggless, desired date, quantity and Chennai locality.
- Every submitted order receives a unique `DH-YYYY-XXXXXX` order ID. The same number is sent to WhatsApp.
- Admin tracks workflow, scheduled follow-up, payment status, private notes and a customer-visible update.
- Admin can add WhatsApp orders through the API; a dedicated “add manual order” screen is the next small UI enhancement if wanted.
- Manual payments only: no QR image or Razorpay integration is shown to customers. Admin sends the correct QR/UPI on WhatsApp after approving the order.

## Deployment (Vercel + Supabase)

1. Create a new Supabase project in the Mumbai/Singapore region. In **SQL Editor**, run `supabase-schema.sql`.
2. In Supabase **Settings → API**, copy Project URL and the **service_role** secret. Keep the service-role secret private. It must only exist as a server environment variable.
3. Copy `.env.example` to `.env.local` and fill all three values. Generate a long, unique admin dashboard password.
4. Run `npm install`, then `npm run dev`. Test: submit an order → confirm it appears in Supabase → use `/track` with the ID + phone → load `/admin` with the dashboard password.
5. Put this repository in a private GitHub repository. Import it in Vercel. Add the same three environment variables under **Production** (and Preview if needed). Deploy.
6. Attach your domain, e.g. `dessertyhouse.in`, and add it to Google Business Profile and Instagram bio.

## Required environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only database access. Never add to client code or share. |
| `ADMIN_DASHBOARD_PASSWORD` | Yes | Temporary owner dashboard login password |

## Recommended production hardening before advertising widely

1. Replace the temporary password header dashboard with **Supabase Auth** for the owner’s email, ideally with MFA. This avoids a password travelling in each dashboard request.
2. Add rate limiting / CAPTCHA to `/api/orders` and `/api/admin`; otherwise a public form can receive spam.
3. Add an audit log table for admin status/payment edits.
4. Add a secure image upload bucket for real cake photos and customer inspiration images. Do not accept unrestricted uploads on the server.
5. Add a privacy policy: name, phone, order information, retention period and WhatsApp use. Collect only necessary data.
6. For Razorpay later: create a merchant account, use server-side Razorpay Orders and webhook signature verification; never mark an order as paid based only on a browser redirect.

## Payment process now

1. Customer submits request (no money requested).
2. Admin confirms design, availability, price and delivery fee in WhatsApp.
3. Admin sends their chosen QR/UPI payment instructions manually.
4. Admin verifies payment in their bank/UPI app and updates the order to **Advance received** or **Paid in full**.

This matches your request that every transaction remains controlled by the owner. Delivery cost is not included in product pricing and is confirmed based on Chennai delivery location.

## Add real product content

Replace temporary AI concept images in `public/` with real, well-lit photos as orders are completed. Update names/descriptions/product IDs in `app/products.ts`. Add each reel URL to the product data when you have a specific Instagram Reel for it; then render a “Watch this design” link in that product card. Do not claim AI concept imagery is a delivered customer order.

## Google / Instagram profile copy

**Business description:** Dessert(y) House is a Chennai home bakery for fresh brownies, bento cakes, birthday cakes, cupcakes, donuts, bomboloni and handmade fondant cakes. Egg and eggless options are available by customer choice. Pre-orders only. Delivery charges depend on location and are confirmed separately.

**Instagram bio:** `🍰 Cakes, brownies & fondant art\n📍 Chennai | Egg & eggless options\n💬 Pre-orders on WhatsApp ↓`

**Order URL:** `https://YOUR-DOMAIN/order`  
**Customer tracking URL:** `https://YOUR-DOMAIN/track`

## Project structure

This is the only active Dessert(y) House project. Marketing collateral and publishing instructions are inside it:
- `docs/MARKETING-LAUNCH.md` — Google, Instagram, WhatsApp and local-listing launch instructions.
- `public/marketing/` — reusable launch banners.
- `public/` — website images.
- `app/` — Next.js website, customer order flow and owner dashboard.
- `supabase-schema.sql` — database setup.

## Cloudinary image delivery

The optimised image package has been uploaded to a Cloudinary folder named `Desserty House`, with `selection`, `previous-orders` and `site` folders visible. Set these Vercel environment variables before deployment:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=pjn0251d
NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER=Desserty House
```

The site then uses Cloudinary transformations (`f_auto,q_auto,w_auto,dpr_auto`) for all selection and previous-order images. The code retains a local-image fallback until these variables are provided. If a Cloudinary asset’s **Public ID** differs from its visible folder/file path, send one asset’s delivery URL; update the root/public-ID mapping before deployment.

## Admin uploads and deleting future posts

`/posts` is the public page for offer and upcoming-product posts. The admin API at `/api/admin/posts` is prepared to upload an image directly into Cloudinary folder `Desserty House/upcoming-posts`, store its title/description in `posts`, and publish it on the website.

To activate it add these **server-only** Vercel variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. The admin dashboard must then expose the upload form (next dashboard update). When an admin deletes a post, the API first deletes the Cloudinary asset by its exact Public ID and then deletes its database record, so it disappears from both Cloudinary and the public `/posts` page.

## Final Cloudinary-only media mode

The repository no longer contains the heavy product/showcase images. All customer-facing images resolve through `/api/media`, which securely looks up the matching Cloudinary asset by its **asset folder** and **original filename**, then redirects the browser to an optimised Cloudinary delivery URL. This is necessary because Cloudinary assigned unique suffixes such as `dh-showcase-46_ehsejs` to Public IDs. It requires the three private `CLOUDINARY_*` deployment variables. Do not remove the `Desserty House/selection`, `Desserty House/previous-orders`, or `Desserty House/site` asset folders in Cloudinary.
