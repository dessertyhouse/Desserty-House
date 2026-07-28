# Dessert(y) House — project handover

**Project:** Dessert(y) House home bakery website and owner operations workspace  
**Service area:** Chennai, Tamil Nadu, India  
**Customer order channel:** WhatsApp +91 89394 11490  
**Current production site:** `https://desserty-house.vercel.app/`  
**Instagram:** `https://www.instagram.com/dessertyhouse/`  
**Last handover update:** 22 July 2026

---

## 1. Purpose

This Next.js project is a marketing website and bakery-operations starter for Dessert(y) House. It helps customers browse cakes/desserts, submit a pre-order request, track their order, and contact the bakery on WhatsApp. It also provides an owner dashboard for manually managing orders, payment status, production workflow and customer follow-ups.

The intended business model is **pre-order only**, with owner-controlled payment confirmation and Chennai delivery charges quoted separately by location.

---

## 2. Customer-facing functionality

### Home page — `/`

- Premium home-bakery visual theme.
- Hero messaging: brownies, cakes and fondant art in Chennai.
- Direct WhatsApp order CTA.
- Trust points: egg/eggless choices, made to order, Chennai delivery.
- Seven menu categories with unique product IDs:
  - `BRW-001` — Brownies
  - `BEN-001` — Bento Cakes
  - `FON-001` — Fondant Cakes
  - `BOM-001` — Bomboloni
  - `CUP-001` — Cupcakes
  - `DON-001` — Donuts
  - `BDY-001` — Birthday Cakes
- Responsive mobile layout. Desktop navigation becomes a compact mobile menu link at narrow widths.
- “How to order” section and customer creation/showcase CTA.

### Product pages — `/menu/[slug]`

Product pages exist for all seven categories. Each category contains 10 product-style references with unique codes such as:

- `BRW-01` through `BRW-10`
- `BEN-01` through `BEN-10`
- `FON-01` through `FON-10`

Customers can click a style and reach the order request form with the relevant product/style preselected.

### Previous Orders / Our Creations — `/showcase`

- Contains 46 genuine previous-order showcase images sourced from the shared Drive folder and uploaded to Cloudinary.
- Each item has a code: `DH-SHOW-001` through `DH-SHOW-046`.
- Cards include category, image-matched title, safe visual description, order-similar-style CTA and Instagram profile link.
- Avoid claiming a specific flavour or ingredient unless the bakery has confirmed it; many descriptions intentionally refer only to visible decoration/presentation.

### Customer order form — `/order`

Captures:

- Product ID
- Selected style/showcase reference, where applicable
- Customer name
- WhatsApp number
- Required/event date
- Egg / eggless / no preference
- Regular vs bulk/corporate/party order type
- Quantity / servings
- Chennai delivery or pickup locality
- Theme, flavour or design notes

Behaviour:

- Creates a unique `DH-YYYY-XXXXXX` order ID.
- Stores request in Supabase.
- Sends customer to WhatsApp with the order ID after submitting.
- No online payment is taken by the website currently.
- Bulk-order notice: customers should enquire at least **15 days ahead**; large custom/fondant/corporate requirements should ideally be planned **30 days ahead**.

### Customer tracking — `/track`

Customers use their order ID plus the WhatsApp number used for the request. They see only the approved public fields, including status, product, required date, payment status and customer-visible owner update.

### Offers/posts — `/posts`

Public page designed for published offers, launches, announcements and seasonal posts created through the owner Content Studio. It depends on the `posts` Supabase table.

---

## 3. Image delivery / Cloudinary

### Why images are not in GitHub

The original local image assets were intentionally removed from the final Git repository to keep it fast and avoid GitHub/Vercel file-size issues. Images are delivered from Cloudinary.

### Cloudinary account

- **Cloud name:** `pjn0251d`
- Media Library folders used:
  - `Desserty House/selection/…`
  - `Desserty House/previous-orders`
  - `Desserty House/site`
  - `Desserty House/upcoming-posts` (admin-created posts)

Cloudinary assigns unique suffixes to Public IDs, e.g. `bento-9_c6kezf`. Therefore `app/api/media/route.ts` looks up a matching item by folder and Public ID prefix, rather than assuming an exact predictable URL.

The media delivery route applies Cloudinary transformations:

```text
f_auto,q_auto,w_auto,dpr_auto
```

This lets Cloudinary deliver optimised formats/sizes for each browser/device.

### Important Cloudinary security incident

At one point, a Cloudinary API secret appeared in Vercel function logs because a diagnostic route logged the raw Cloudinary error object. That key pair must be revoked/rotated in Cloudinary. The current intended media route logs only safe error messages and must never log request options/authentication objects.

Do not expose:

- `CLOUDINARY_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- admin password
- any Vercel environment-variable value

---

## 4. Admin workspace

### Owner dashboard — `/admin`

Current order dashboard features:

- Owner password gate (using `ADMIN_DASHBOARD_PASSWORD`).
- Order metrics: open orders, due follow-ups, payments received, total requests.
- Search by order ID, name, phone or product code.
- Filter by workflow status.
- Add manual WhatsApp order.
- Update workflow status:
  - Request received
  - Awaiting customer reply
  - Quote sent
  - Awaiting advance
  - Confirmed
  - In production
  - Ready
  - Out for delivery
  - Completed
  - Cancelled
- Update payment status.
- Save follow-up/production schedule.
- Save private owner notes.
- Save customer-visible update.
- Click-to-WhatsApp customer shortcut.

The admin link is intentionally not shown in public navigation. The `/admin` and `/track` pages are `noindex`.

### Content Studio

The Content Studio component is `app/admin/PostManager.tsx` and must be rendered by `app/admin/page.tsx` as:

```tsx
<PostManager password={pw}/>
```

Its intended functionality:

- Create offer/new-launch/announcement/seasonal posts.
- Preview selected image before publish.
- Require a checkbox confirmation before publish.
- Generate a post code: `DH-POST-YYYY-XXXXXX`.
- Upload image to Cloudinary `Desserty House/upcoming-posts`.
- List and delete posts; delete action should delete both the Supabase record and Cloudinary asset.
- Recommended post image: **1080 × 1350 px**, **4:5 portrait**, WebP/JPG, ideally under **1 MB**, max **8 MB**.

If Content Studio is missing in production, confirm the latest `app/admin/page.tsx` includes the component and that the `posts` table exists in Supabase.

### Workers panel — `/admin/workers`

Recently added starter panel. Admin only can:

- Add worker
- Set worker name, role, phone, skills, active/inactive status, private notes
- View assignment count

Workers do **not** have a customer-facing or worker-facing login in the agreed first workflow. Workers report updates by WhatsApp/call and the owner records the updates.

### Reports panel — `/admin/reports`

Recently added starter panel. Owner can choose a custom date range and see:

- total orders
- completed orders
- open orders
- unassigned orders
- per-worker assigned/completed/open counts

### Worker workflow agreed by owner

- Admin assigns workers manually after an order is confirmed.
- Worker has no system edit access.
- Detailed production statuses desired:
  1. Confirmed
  2. Ingredients ready
  3. Baking
  4. Decorating
  5. Quality check
  6. Ready for handover
  7. Out for delivery
  8. Completed
- Admin coordinates delivery; workers do not manage dispatch.
- Worker assignment should lock after assignment.
- Reassignment must require a reason and store history.
- Dashboard-only alerts are desired for due today, overdue, unassigned and stuck orders.
- Admin wants worker active-order count before assigning.

**Important:** Worker assignment locking/reassignment history UI is not yet connected into the main order card. Database fields/migration have been prepared but the UI and API need final implementation.

---

## 5. Databases

### Primary live application database: Supabase

The project uses Supabase, not Neon, for operational data.

Required Vercel variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SERVER_ONLY_SECRET
ADMIN_DASHBOARD_PASSWORD=LONG_UNIQUE_OWNER_PASSWORD
```

The `SUPABASE_SERVICE_ROLE_KEY` must only exist in server-side Vercel environment variables. It must not be exposed to browser/client code.

### SQL files

1. `supabase-schema.sql`
   - `orders`
   - `posts`
   - legacy `product_styles` / `offers` foundation

2. `worker-workflow-migration.sql`
   - `workers`
   - `worker_assignment_history`
   - order fields: `worker_id`, `worker_assigned_at`, `completed_at`, delivery fields

3. `cms-admin-migration.sql`
   - future full CMS/team role foundation:
     - `staff_profiles`
     - `site_settings`
     - `catalog_products`
     - `catalog_styles`
     - `showcase_items`
     - `content_revisions`

Run SQL files in **Supabase SQL Editor**, in logical order, after backing up production data. If admin reports `Could not find the table public.orders in the schema cache`, `supabase-schema.sql` has not been run in the exact Supabase project configured in Vercel.

### Neon

A Neon project link was shared during development, but current application code does not use Neon. Do not configure both databases for the same features unless the app is intentionally migrated.

---

## 6. SEO and local discovery

Implemented:

- `app/robots.ts` — allows public pages, disallows `/admin` and `/api`.
- `app/sitemap.ts` — homepage, showcase, posts and category pages.
- Metadata and keywords in `app/layout.tsx`.
- Bakery Schema.org JSON-LD in home page.
- Chennai/local bakery keywords.
- Publishing instructions in `docs/SEO-PUBLISHING.md`.

Important pages after deployment:

```text
/robots.txt
/sitemap.xml
```

### Post-launch tasks

1. Attach a real custom domain, ideally `dessertyhouse.in`.
2. Change hard-coded `https://desserty-house.vercel.app` references in metadata, robots and sitemap to the final canonical domain.
3. Verify domain in Google Search Console.
4. Submit `https://YOURDOMAIN/sitemap.xml`.
5. Create/verify Google Business Profile as a service-area bakery in Chennai. Hide home address if customers do not visit.
6. Use the same name, phone, website, Chennai service area and description in Google Business, Instagram, WhatsApp Business, Facebook, Justdial and Sulekha.
7. Request genuine reviews after completed orders.

No SEO implementation can ethically guarantee first place in Google/AI results. Local authority comes from accurate business listings, real reviews, genuine images, useful pages, customer mentions and time.

---

## 7. Key project files

```text
app/page.tsx                    Homepage
app/layout.tsx                  Metadata / global layout
app/globals.css                 Theme and responsive styling
app/products.ts                 Current static product/category/style catalogue
app/showcase/data.ts            Current static previous-order descriptions/catalogue
app/showcase/page.tsx           Showcase page
app/order/page.tsx              Customer order form
app/track/page.tsx              Customer tracking
app/posts/page.tsx              Public posts/offers page
app/admin/page.tsx              Owner order dashboard
app/admin/PostManager.tsx       Owner post manager
app/admin/workers/page.tsx      Worker manager starter
app/admin/reports/page.tsx      Reports starter
app/api/orders/route.ts         Customer order API
app/api/admin/route.ts          Owner order API
app/api/admin/posts/route.ts    Posts/Cloudinary API
app/api/admin/workers/route.ts  Worker API
app/api/admin/reports/route.ts  Report API
app/api/media/route.ts          Cloudinary lookup/delivery redirect
app/robots.ts                   robots.txt
app/sitemap.ts                  sitemap.xml
supabase-schema.sql             Core database setup
worker-workflow-migration.sql   Worker/reporting schema migration
cms-admin-migration.sql         Future full CMS schema migration
docs/SEO-PUBLISHING.md          SEO publishing checklist
docs/WORKFLOW-DESIGN.md         Agreed worker/order process
```

---

## 8. Current limitations / next implementation priority

### Not yet fully complete

The project currently stores much of the public catalogue in source files (`app/products.ts`, `app/showcase/data.ts`, `app/page.tsx`). Therefore, owner cannot yet edit all homepage/menu/showcase text/cards from admin without a code deployment.

The planned full CMS must:

- Move static products, styles, showcase items, homepage settings, footer/navigation and SEO text into Supabase.
- Build owner-only admin CRUD screens for those tables.
- Add draft → preview → publish state.
- Add content manager/baker/owner roles via Supabase Auth, replacing the single password gate for team-level access.
- Keep customer phone/payment information owner-only.
- Add visual ordering and hide/publish controls.
- Complete worker assignment and immutable/reassignment-history UI in the order dashboard.

### Security priority

Replace the temporary password-header admin authentication with Supabase Auth + MFA for owner(s). Add rate limiting / CAPTCHA to the public order request endpoint before major advertising.

---

## 9. Deployment

### Local development

```bash
npm install
npm run dev
```

### Production validation

```bash
npm run build
```

### Vercel environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DASHBOARD_PASSWORD=
CLOUDINARY_CLOUD_NAME=pjn0251d
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use Production environment scope, then redeploy without cache after changing a value.

Never commit `.env.local`, secrets or service keys.

---

## 10. Admin Workspace Version 2 — approved target architecture

### Goal

Transform the present editable order list into a workflow-first bakery operations workspace. The owner should be able to answer quickly: **what needs action now, what is overdue, and what needs to be produced today?**

### Target navigation

```text
Dashboard · Orders · Production · Customers · Products · Showcase · Posts · Workers · Reports · Website CMS · Settings
```

### Dashboard / Action Center

Show clickable operational KPIs: new orders today, orders due today, overdue orders, awaiting customer reply, waiting advance payment, production today, ready for delivery, completed today, and today's revenue. Add a top `Attention Required` area for urgent delayed/payment/follow-up items.

### Orders

Use compact order rows/cards rather than all fields visible at once. Each shows order ID, customer, product, quantity, due date, area, workflow/payment status, assigned worker and priority. Primary actions: open details, WhatsApp, call and assign worker. Detail view should be a side drawer/tabbed view: Customer, Order, Payment, Production, Notes and History.

### Workflow

Use guided status actions instead of a general dropdown:

```text
Request received → Awaiting customer reply → Quote sent → Awaiting advance → Confirmed → Ingredients ready → Baking → Decorating → Quality check → Ready → Out for delivery → Completed
```

Every transition must create an immutable, timestamped operator history record.

### Production, customer CRM and reports

Production needs today's queue, upcoming work, worker capacity, assignments and delayed work. Customer CRM needs order history, lifetime value, repeat count, contact data, notes and preferred products. Reports need revenue, order count, average order, popular products/areas, worker performance, completion/cancellation rate and monthly growth.

### Website CMS

Owner-managed, database-backed content screens: Homepage, categories, products, showcase, offers, testimonials, FAQ, SEO, navigation and footer. Use Draft → Preview → Publish. No code deployment for normal content updates.

### Alerts, mobile and security

Highlight overdue orders, payment pending, follow-ups, new orders and production delays. Optimise operations for phone use with quick actions and sticky/bottom navigation. Replace the temporary password gate with Supabase Auth, roles, MFA, audit logs and rate limiting. Never expose server secrets client-side.

---

## 11. Operational notes for next AI/developer

- The user prefers clear, practical instructions and expects changes to be actually implemented, not merely described.
- Do not claim the full CMS/team workflow is complete until public pages read CMS data and owner screens can CRUD/publish it.
- Keep generated concept images separate from genuine completed-order images. Do not describe AI concept visuals as previous customer work.
- Preserve existing unique product/style/showcase/order codes unless intentionally migrating with a mapping.
- Customer delivery cost is separate and must not be included in product price by default.
- Payments are manually controlled by owner through WhatsApp/QR/UPI at present; do not mark payment successful automatically without verified gateway/webhook integration.
- For custom/fondant/corporate orders, preserve the 15-day minimum / 30-day preferred planning message.
