# 📘 Complete Publishing & SEO Guide (Beginner-Friendly)

This guide takes you from the code in this folder to a live, Google-indexed,
AI-discoverable website — with zero prior web development experience assumed.

---

## Part 1 — Understand what you have

This is a **Next.js** website. Unlike a plain HTML site, you don't upload
individual files to a "root directory" by FTP. Instead, you push the whole
project to **GitHub**, and a free hosting service called **Vercel** builds and
publishes it for you. Vercel gives you free HTTPS (the padlock), a global CDN
(fast loading worldwide) and automatic redeploys whenever you update the code.

**Files that must be in the project (all already included):**

| File / folder | What it does |
|---|---|
| `src/app/` | All website pages (Home, Products, FAQ, etc.) |
| `src/lib/site.ts` | ⭐ Your business details — edit this file first |
| `src/app/robots.ts` | Generates `robots.txt` automatically at `/robots.txt` |
| `src/app/sitemap.ts` | Generates `sitemap.xml` automatically at `/sitemap.xml` |
| `src/app/llms.txt/route.ts` | Generates `/llms.txt` for AI assistants |
| `src/app/llms-full.txt/route.ts` | Generates `/llms-full.txt` (detailed AI knowledge base) |
| `src/app/manifest.ts` | Generates the PWA `manifest.json` |
| `src/app/rss.xml/route.ts` | Generates the RSS feed at `/rss.xml` |
| `next.config.ts` | Security headers, caching, image optimization |
| `public/` | Favicon, PWA icons, social-share image |
| `.env.example` | Template for your secret keys (copy to `.env.local`) |
| `package.json` | Lists the software the site needs to build |

> Because `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`,
> `manifest.json` and `rss.xml` are **generated from code**, you never edit
> them by hand — they update themselves when you edit your products, FAQs or
> site config.

---

## Part 2 — Publish the website (Vercel, free)

1. **Create accounts** (all free): [github.com](https://github.com), [vercel.com](https://vercel.com), [supabase.com](https://supabase.com), [cloudinary.com](https://cloudinary.com).
2. **Set up Supabase** (your order database):
   - New project → region Mumbai/Singapore.
   - SQL Editor → paste and run each file from the `sql/` folder in this order:
     `supabase-schema.sql`, `admin-v2-migration.sql`, `audit-log-migration.sql`,
     `cms-admin-migration.sql`, `worker-workflow-migration.sql`.
   - Settings → API → copy the **Project URL** and **service_role key**.
3. **Push this code to GitHub**: create a **private** repository, upload this
   entire folder (GitHub Desktop app is easiest for beginners: File → Add local
   repository → Publish).
4. **Import to Vercel**: vercel.com → *Add New → Project* → select your GitHub
   repo → before clicking Deploy, open **Environment Variables** and add every
   variable from `.env.example` with real values:
   - `NEXT_PUBLIC_SITE_URL` → your final domain, e.g. `https://dessertyhouse.in`
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_DASHBOARD_PASSWORD` (invent a strong one)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Click **Deploy**. In ~2 minutes you get a live URL like
   `https://desserty-house.vercel.app` — already HTTPS-secured.

---

## Part 3 — Connect your own domain

1. Buy a domain (e.g. `dessertyhouse.in`) from GoDaddy, Hostinger, Namecheap or
   BigRock (₹300–900/year for `.in`).
2. In Vercel: your project → **Settings → Domains → Add** → type your domain.
3. Vercel shows you DNS records. In your domain provider's DNS panel add:
   - **A record**: name `@`, value `76.76.21.21`
   - **CNAME record**: name `www`, value `cname.vercel-dns.com`
4. Wait 5 minutes–24 hours. Vercel automatically issues a free HTTPS certificate.
5. **Important:** update the `NEXT_PUBLIC_SITE_URL` environment variable in
   Vercel to your new domain and click **Redeploy** — this updates every
   canonical URL, the sitemap, robots.txt, llms.txt and JSON-LD automatically.

---

## Part 4 — Verify the site is publicly accessible

Open these URLs in an incognito/private browser window (and on your phone using
mobile data, not Wi-Fi):

- `https://yourdomain.in/` — home page loads with padlock icon
- `https://yourdomain.in/robots.txt` — shows crawl rules + sitemap line
- `https://yourdomain.in/sitemap.xml` — lists every page
- `https://yourdomain.in/llms.txt` and `/llms-full.txt` — business summary text
- `https://yourdomain.in/manifest.json` — app manifest
- `https://yourdomain.in/rss.xml` — feed

Also test: [pagespeed.web.dev](https://pagespeed.web.dev) (performance),
[validator.schema.org](https://validator.schema.org) and Google's
[Rich Results Test](https://search.google.com/test/rich-results) (paste your
home, FAQ and one product URL).

---

## Part 5 — Google Search Console (submit the sitemap)

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add property → choose **Domain** → enter `yourdomain.in`.
3. Google shows a **TXT record** — add it in your domain provider's DNS panel
   (same place as Part 3), then click Verify.
4. In the left menu: **Sitemaps** → enter `sitemap.xml` → Submit.
   Status should become "Success" within a day.

### Request indexing for every page
1. In Search Console, use the **URL Inspection** bar at the top.
2. Paste each important URL (home, /products, each /menu/… page, /faq,
   /custom-cakes, /wedding-cakes, /showcase, /contact, /about).
3. Click **Request Indexing** for each. (Limit ~10–12/day — do the rest tomorrow.)

## Part 6 — Bing Webmaster Tools

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters).
2. Sign in → **Import from Google Search Console** (one click — it copies your
   verified site and sitemap automatically). Otherwise add the site manually
   and verify with a DNS record.
3. Submit `https://yourdomain.in/sitemap.xml` under Sitemaps.
4. Bing powers **Microsoft Copilot, DuckDuckGo and partially ChatGPT search**,
   so this step directly helps AI discovery.

---

## Part 7 — Ongoing maintenance

### Keeping the sitemap updated automatically
Nothing to do. The sitemap is generated from `src/app/sitemap.ts`:
- Adding a product to `src/app/products.ts` → its page AND sitemap entry appear automatically.
- Adding a brand-new static page → add one line to the `staticPages` list in `src/app/sitemap.ts`.
Every Git push triggers a Vercel redeploy, which regenerates everything.

### Maintaining robots.txt / llms.txt / llms-full.txt
- All three are code-generated. Edit `src/lib/site.ts` (business details),
  `src/app/faq/data.ts` (FAQs) or `src/app/products.ts` (catalog) — the txt
  files rebuild themselves on the next deploy.
- To block a new private section, add its path to the `disallow` list in
  `src/app/robots.ts`.
- Review `/llms-full.txt` monthly: it should always match your real prices
  policy, lead times and delivery areas.

### Checking for SEO errors
- **Search Console → Pages**: shows "Why pages aren't indexed" with reasons.
- **Search Console → Enhancements**: FAQ, Breadcrumb, Product rich-result errors.
- Free crawlers: [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) or
  Screaming Frog (free up to 500 URLs) — run monthly, fix broken links and
  missing titles.

### Monitoring indexing status
- Search Console → **Pages** report: watch "Indexed" count grow (expect all ~23
  pages within 2–6 weeks).
- Quick check: search `site:yourdomain.in` on Google and Bing.
- **Performance** report: which queries show your site, clicks, position.

### Improving rankings over time
1. **Google Business Profile** (critical for a local bakery): create at
   [business.google.com](https://business.google.com), add photos, hours, your
   website link, and collect Google reviews — this drives "cake shop near me" traffic.
2. **Publish regularly**: use the admin dashboard to post offers (feeds /posts
   and the RSS feed). Fresh content = more crawls.
3. **Earn local links**: Chennai food bloggers, wedding directories (WedMeGood,
   WeddingWire), Justdial, Sulekha listings — same name/phone everywhere (NAP consistency).
4. **Add real reviews**: replace the placeholder testimonials in
   `src/app/testimonials/data.ts` with genuine ones (never fake them).
5. **Instagram → website**: keep the site link in bio; social signals help discovery.
6. Watch Search Console queries and write FAQ/blog answers for what people
   actually search ("eggless birthday cake Chennai", "bento cake near me").

### Making AI assistants understand your site better
Already built in: `llms.txt`, `llms-full.txt`, full Schema.org graph, semantic
HTML, and robots.txt that explicitly welcomes GPTBot, ClaudeBot, PerplexityBot,
Google-Extended and others. To strengthen further:
- Keep facts **consistent** across the site, Google Business Profile, Instagram
  and directories — AI models cross-check sources.
- Use clear, factual sentences on pages (already done: lead times, areas,
  process are stated explicitly — AI quotes these).
- Get mentioned on other sites (reviews, directories, news) — LLMs learn your
  brand from the wider web, not just your own site.
- Test it: ask ChatGPT/Perplexity "home bakery in Chennai for eggless bento
  cakes" and see if you appear once indexed; Perplexity and Copilot use
  Bing/Google indexes, so Parts 5–6 matter most.

### Troubleshooting: not being indexed?
| Symptom | Fix |
|---|---|
| `site:yourdomain.in` shows nothing after 4+ weeks | Search Console → URL Inspection → check for "noindex" or errors; Request Indexing again |
| "Discovered – currently not indexed" | Normal for new sites. Keep publishing, get 2–3 external links (directories), wait |
| Sitemap "Couldn't fetch" | Confirm `https://yourdomain.in/sitemap.xml` opens in browser; resubmit |
| Pages blocked | Ensure the page isn't under /admin; check robots.txt in browser |
| AI chatbots don't know the site | They rely on search indexes + periodic crawls; confirm Google/Bing indexing first, then allow weeks–months. Check Vercel logs for GPTBot/ClaudeBot visits |
| Wrong domain in sitemap/canonical | You forgot to update `NEXT_PUBLIC_SITE_URL` in Vercel → fix and redeploy |

---

## Part 8 — Monthly 15-minute checklist

- [ ] Search Console: any new errors? Indexed count still correct?
- [ ] Bing Webmaster: same check.
- [ ] Post at least 1–2 offers/updates via admin (feeds blog + RSS).
- [ ] Ask 2–3 happy customers for Google reviews.
- [ ] PageSpeed test still green on mobile.
- [ ] `/llms-full.txt` still factually accurate.
