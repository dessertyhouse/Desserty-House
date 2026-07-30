import type { NextConfig } from 'next';

/**
 * Next.js configuration.
 * - images.remotePatterns: allows optimized loading from Unsplash + Cloudinary.
 * - headers(): security headers applied to every response (HSTS, clickjacking,
 *   MIME-sniffing and referrer protections) plus long-lived caching for static assets.
 * - compress: gzip/brotli compression for faster page loads.
 */
const securityHeaders = [
  // Force HTTPS for 2 years (only takes effect once you're serving over HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent this site from being embedded in iframes (clickjacking protection)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send only the origin as referrer to other sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable powerful browser features we don't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // Content Security Policy: allow own content, Cloudinary/Unsplash images, Google Maps embed
  {
    key: 'Content-Security-Policy',
    value: [
      // Google AdSense needs to load, render and report from its own domains.
      // Without these entries the browser silently blocks the ad script and no
      // ads ever appear — the most common reason AdSense "does nothing".
      "default-src 'self'",
      // adtrafficquality.google is AdSense's invalid-traffic detection; blocking
      // it throws CSP errors and can hurt ad serving, so it must be allowed too.
      "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      // Ads render inside iframes served from these hosts.
      "frame-src https://www.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagservices.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    // Serve the PWA manifest at /manifest.json too (Next.js default is /manifest.webmanifest)
    return [{ source: '/manifest.json', destination: '/manifest.webmanifest' }];
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      {
        // Cache static icons/images aggressively (immutable filenames)
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(favicon.ico|og-image.png)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },
};

export default nextConfig;
