# Dessert(y) House — website and order workflow

A clean replacement for the old unrelated repository. It provides a public menu with fixed product IDs, an order-request form, WhatsApp hand-off, customer order lookup, and a one-owner order/follow-up dashboard.

## What is included

- **Products**: Brownies (`BRW-001`), Bento Cakes (`BEN-001`), Fondant Cakes (`FON-001`), Bomboloni (`BOM-001`), Cupcakes (`CUP-001`), Donuts (`DON-001`), Birthday Cakes (`BDY-001`).
- Customer selects egg/eggless, desired date, quantity and Chennai locality.
- Every submitted order receives a unique `DH-YYYY-XXXXXX` order ID. The same number is sent to WhatsApp.
- Admin tracks workflow, scheduled follow-up, payment status, private notes and a customer-visible update.
- Admin can add WhatsApp orders through the API; a dedicated "add manual order" screen is available.
- Manual payments only: no QR image or Razorpay integration is shown to customers. Admin sends the correct QR/UPI on WhatsApp after approving the order.

## Security Features

- ✅ **Rate Limiting**: API endpoints are protected against spam with configurable rate limits
- ✅ **CAPTCHA Protection**: Honeypot field + timestamp validation on order forms
- ✅ **Session-based Admin Auth**: Secure cookie-based sessions for admin dashboard
- ✅ **Audit Logging**: All admin actions are logged for compliance
- ✅ **Input Validation**: Server-side validation on all form submissions
- ✅ **SQL Injection Protection**: Using Supabase client with parameterized queries

## Deployment (Vercel + Supabase)

1. Create a new Supabase project in the Mumbai/Singapore region. In **SQL Editor**, run `supabase-schema.sql`.
2. In Supabase **Settings → API**, copy Project URL and the **service_role** secret. Keep the service-role secret private. It must only exist as a server environment variable.
3. Copy `.env.example` to `.env.local` and fill all values:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `ADMIN_DASHBOARD_PASSWORD` - A strong, unique admin password
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

4. Run `npm install`, then `npm run dev`. Test: submit an order → confirm it appears in Supabase → use `/track` with the ID + phone → load `/admin` with the dashboard password.
5. Put this repository in a private GitHub repository. Import it in Vercel. Add the same environment variables under **Production** (and Preview if needed). Deploy.
6. Attach your domain, e.g. `dessertyhouse.in`, and add it to Google Business Profile and Instagram bio.

## Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only database access. Never add to client code or share. |
| `ADMIN_DASHBOARD_PASSWORD` | Yes | Admin dashboard login password |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for image storage |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

## Admin Dashboard Features

### Authentication
- Session-based authentication with secure HTTP-only cookies
- 24-hour session duration
- Login rate limiting (5 attempts per minute)
- Automatic session expiration

### Order Management
- View all orders with filtering and sorting
- Update order status and payment status
- Schedule follow-ups with date/time picker
- Add private admin notes (not visible to customers)
- Set customer-visible updates
- Add WhatsApp orders manually

### Content Management
- Upload promotional posts with images
- Manage post visibility (publish/draft)
- Automatic image optimization via Cloudinary

### Audit Logging
All admin actions are logged including:
- Order status changes
- Payment status updates
- Post creation/deletion
- Admin login/logout

## Privacy & Compliance

A privacy policy page (`/privacy`) is included covering:
- Data collection practices
- WhatsApp communication consent
- Data retention policies
- User rights and contact information

## Payment Process

1. Customer submits request (no money requested).
2. Admin confirms design, availability, price and delivery fee in WhatsApp.
3. Admin sends their chosen QR/UPI payment instructions manually.
4. Admin verifies payment in their bank/UPI app and updates the order to **Advance received** or **Paid in full**.

This matches your request that every transaction remains controlled by the owner. Delivery cost is not included in product pricing and is confirmed based on Chennai delivery location.

## Add Real Product Content

Replace temporary AI concept images in `public/` with real, well-lit photos as orders are completed. Update names/descriptions/product IDs in `app/products.ts`. Add each reel URL to the product data when you have a specific Instagram Reel for it; then render a "Watch this design" link in that product card. Do not claim AI concept imagery is a delivered customer order.

## Google / Instagram profile copy

**Business description:** Dessert(y) House is a Chennai home bakery for fresh brownies, bento cakes, birthday cakes, cupcakes, donuts, bomboloni and handmade fondant cakes. Egg and eggless options are available by customer choice. Pre-orders only. Delivery charges depend on location and are confirmed separately.

**Instagram bio:**
```
🍰 Cakes, brownies & fondant art
📍 Chennai | Egg & eggless options
💬 Pre-order on WhatsApp
🎂 Custom celebrations
🔗 Link in bio
```

## Recommended Production Hardening

1. ~~Replace the temporary password header dashboard with **Supabase Auth** for the owner's email, ideally with MFA.~~ (Session-based auth implemented)
2. ✅ Add rate limiting / CAPTCHA to `/api/orders` and `/api/admin` (Implemented)
3. ✅ Add an audit log table for admin status/payment edits (Implemented)
4. Add a secure image upload bucket for real cake photos and customer inspiration images. Do not accept unrestricted uploads on the server.
5. ✅ Add a privacy policy (Implemented)
6. For Razorpay later: create a merchant account, use server-side Razorpay Orders and webhook signature verification; never mark an order as paid based only on a browser redirect.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## File Structure

```
app/
├── admin/              # Admin dashboard
│   ├── page.tsx        # Main admin interface
│   └── PostManager.tsx # Content management component
├── api/
│   ├── admin/
│   │   ├── auth/       # Admin authentication
│   │   ├── posts/      # Post management API
│   │   └── route.ts    # Order management API
│   ├── media/          # Cloudinary image proxy
│   └── orders/         # Order submission & tracking
├── menu/[slug]/        # Dynamic product pages
├── order/              # Order request form
├── posts/              # Public offers page
├── privacy/            # Privacy policy
├── showcase/           # Previous orders gallery
├── track/              # Order tracking
├── page.tsx            # Homepage
├── products.ts         # Product catalog
└── layout.tsx          # Root layout

lib/
├── auth.ts             # Admin authentication
├── captcha.ts          # Honeypot CAPTCHA
├── rate-limit.ts       # Rate limiting
├── audit-log.ts        # Audit logging
└── supabase.ts         # Supabase client

docs/                   # Documentation
public/                 # Static assets
```
