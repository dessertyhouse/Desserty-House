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
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-src https://www.google.com",
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
