# AdSense — Where To Paste It

## ⚠️ Read this first

**Pasting only the AdSense script into your site would NOT have worked.**

Your site sends a `Content-Security-Policy` header (in `next.config.ts`) that told
browsers "only load scripts from our own domain." AdSense loads from
`googlesyndication.com`, so the browser would have **silently blocked it**. No
error visible to you, no ads, and you'd likely have blamed AdSense or assumed the
approval hadn't come through.

I hit exactly this in testing. The browser console showed:

```
Refused to load the script 'https://pagead2.googlesyndication.com/...'
violates the following Content Security Policy directive
```

So **two files** need editing, not one. Both are already done in the attached zip.

---

## The two files

### 1. `src/app/layout.tsx` — the script itself

Placed inside the existing `<head>` block (around line 100). It's env-driven rather
than hard-coded, so your publisher ID isn't committed to a public GitHub repo:

```tsx
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT ? (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
    crossOrigin="anonymous"
  />
) : null}
```

This renders on **all 45 pages** automatically — Google's requirement of "every page
across your site" is satisfied by the shared layout.

### 2. `next.config.ts` — the CSP allowances

Four directives extended to permit Google's ad domains:

| Directive | Why |
|---|---|
| `script-src` | Load the ad script |
| `img-src` | Ad creatives + tracking pixels |
| `frame-src` | Ads render inside iframes |
| `connect-src` | Ad requests and reporting |

Including `ep1/ep2.adtrafficquality.google` — AdSense's invalid-traffic detection.
I only found that one by watching a real browser; it wasn't obvious from the docs,
and blocking it can hurt ad serving.

---

## What you do now

### Step 1 — Add the environment variable in Vercel

1. Project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `NEXT_PUBLIC_ADSENSE_CLIENT`
   - **Value:** `ca-pub-1473938803361728`
   - **Environments:** tick **Production**
3. **Save**

### Step 2 — Deploy

Push the updated code, or if you already have it: **Deployments → ⋯ → Redeploy**.

> The redeploy is required. `NEXT_PUBLIC_*` variables are baked in at build time.

### Step 3 — Verify

```bash
curl -s https://desserty-house.vercel.app | grep adsbygoogle
```

You should see the script tag with your publisher ID. Then in AdSense, click
**Done** / "Verify".

---

## Why env-driven instead of hard-coded

- Your publisher ID stays out of the public GitHub repo
- Preview deployments and local dev render **no ads** (Google dislikes ads on
  non-production URLs)
- Disabling ads later is a one-field change, no code edit

Verified both ways: with the variable set, the script appears on every page and
there are **zero CSP violations** across 4 pages in a real browser. With it unset,
**zero** occurrences in the built HTML.

---

## 💭 One honest thought before you enable this

You're not indexed yet and have no traffic. A few things worth weighing:

**AdSense earnings at your traffic level will be nearly nothing.** Realistically
₹50–200/month at a few hundred visitors. Meanwhile ads:

- Slow the site down (you just optimised images for speed — this partly undoes it)
- Show **competitor bakery ads** to people who came to order from you
- Make a small artisan brand look less premium
- Cost you conversions worth far more than the ad revenue — one cake order is
  ₹500–3000+, which is months of AdSense income

**AdSense makes sense for content sites** monetising readers. Your site is a
**storefront** — its job is turning visitors into WhatsApp orders.

The code is ready and tested if you want it. But I'd suggest leaving
`NEXT_PUBLIC_ADSENSE_CLIENT` blank until you're getting meaningful traffic — say
1,000+ visitors/month — and even then, only on blog pages rather than product and
order pages.

Your call entirely; nothing is enabled until you set that variable.
