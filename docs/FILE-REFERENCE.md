# 🗂 File-by-File Reference — What Every File Does

## Configuration files (project root)

| File | Purpose |
|---|---|
| `package.json` | Declares dependencies (Next.js, React, Supabase, Cloudinary) and commands (`npm run dev`, `npm run build`). |
| `package-lock.json` | Auto-generated exact dependency versions — never edit manually. |
| `tsconfig.json` | TypeScript compiler settings; defines the `@/` import alias for `src/`. |
| `next.config.ts` | Next.js config: **security headers** (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), gzip compression, AVIF/WebP image optimization, cache headers for icons, and the `/manifest.json` rewrite. |
| `.env.example` | Template of required environment variables. Copy to `.env.local` locally; enter the same values in Vercel for production. |
| `.gitignore` | Keeps secrets (`.env.local`), build output (`.next/`) and `node_modules/` out of Git. |

## SEO / GEO / AI-discovery files (all auto-generated from code)

| Source file | Public URL | Purpose |
|---|---|---|
| `src/app/robots.ts` | `/robots.txt` | Allows all search + AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot…), blocks `/admin` & `/api`, advertises the sitemap. |
| `src/app/sitemap.ts` | `/sitemap.xml` | Every public page + per-product **image sitemap** entries (Google image extension). Auto-includes new products. No videos are used on the site, so no video sitemap is needed — if you add videos later, extend this file with video entries. |
| `src/app/llms.txt/route.ts` | `/llms.txt` | Concise markdown guide for AI assistants (llmstxt.org convention). |
| `src/app/llms-full.txt/route.ts` | `/llms-full.txt` | Full AI knowledge base: catalog, FAQs, ordering process, delivery, policies, contact. |
| `src/app/manifest.ts` | `/manifest.json` | PWA manifest: name, theme colours, icons, app shortcuts. |
| `src/app/rss.xml/route.ts` | `/rss.xml` | RSS 2.0 feed of blog/offers (from Supabase posts). |

## Central data files (edit these to update the whole site)

| File | Controls |
|---|---|
| `src/lib/site.ts` | ⭐ Business name, URL, phone, email, address, geo-coordinates, hours, delivery areas + shared Schema.org builders (Bakery, LocalBusiness, Organization, WebSite, SearchAction, BreadcrumbList). |
| `src/app/products.ts` | Product catalog — pages, sitemap, llms files and schema all derive from it. |
| `src/app/faq/data.ts` | FAQ content — powers the /faq page, FAQPage schema and llms-full.txt. |
| `src/app/testimonials/data.ts` | Reviews — powers /testimonials, Review + AggregateRating schema. ⚠ Replace placeholders with real reviews. |
| `src/app/showcase/data.ts` | Gallery items (previous orders). |

## Layouts & shared components

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout: default metadata (Open Graph, Twitter Cards, robots meta, canonical base, favicon, geo meta tags, RSS link) + global JSON-LD graph. |
| `src/app/(public)/layout.tsx` | Wraps all public pages with the shared header, footer and skip-link. |
| `src/app/admin/layout.tsx` | Marks the admin area `noindex, nofollow`. |
| `src/components/SiteHeader.tsx` | Accessible primary navigation. |
| `src/components/SiteFooter.tsx` | Footer with internal links to every page + NAP block (Local SEO). |
| `src/components/Breadcrumbs.tsx` | Visible breadcrumbs + BreadcrumbList JSON-LD on every page. |
| `src/components/JsonLd.tsx` | Renders Schema.org data as JSON-LD script tags. |

## Pages (all under `src/app/(public)/`)

| Route | File | Schema on page |
|---|---|---|
| `/` | `page.tsx` | Bakery, LocalBusiness, Organization, WebSite, SearchAction |
| `/products` | `products/page.tsx` | ItemList + BreadcrumbList |
| `/menu/[slug]` | `menu/[slug]/page.tsx` | Product, Offer, AggregateRating, ImageObject, Brand |
| `/custom-cakes` | `custom-cakes/page.tsx` | Service |
| `/wedding-cakes` | `wedding-cakes/page.tsx` | Service |
| `/showcase` | `showcase/page.tsx` | ImageGallery + ImageObject |
| `/testimonials` | `testimonials/page.tsx` | Review + AggregateRating |
| `/feedback` | `feedback/page.tsx` | ImageGallery + ImageObject — customer feedback screenshots uploaded by admin (Post type "Customer Feedback") |
| `/posts` | `posts/page.tsx` | Blog + BlogPosting |
| `/faq` | `faq/page.tsx` | FAQPage |
| `/about` | `about/page.tsx` | AboutPage |
| `/contact` | `contact/page.tsx` | ContactPage (+ map embed, hours, NAP) |
| `/order`, `/track` | `order/`, `track/` | BreadcrumbList (transactional pages) |
| `/privacy`, `/terms`, `/shipping-policy`, `/refund-policy` | policy pages | BreadcrumbList |

## Backend (unchanged from original repo)

`src/app/api/*` (orders, admin, media proxy), `src/app/admin/*` (dashboard),
`src/lib/*` (auth, rate-limit, captcha, audit-log, supabase), `sql/*`
(database migrations — run once in Supabase).

## Static assets (`public/`)

`favicon.ico`, `og-image.png` (1200×630 social share image),
`icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`,
`icons/apple-touch-icon.png` — replace with your branded versions any time
(keep the same filenames and sizes).
