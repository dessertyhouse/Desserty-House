import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/**
 * Auto-generated robots.txt, served at /robots.txt.
 * - Allows all crawlers (including AI crawlers: GPTBot, ClaudeBot, PerplexityBot,
 *   Google-Extended, etc.) to index public pages.
 * - Blocks only private areas: /admin and /api.
 * - Advertises the sitemap location.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/'];
  return {
    rules: [
      // Default: everyone may crawl public pages
      { userAgent: '*', allow: '/', disallow },
      // Explicit welcomes for AI/LLM crawlers (Generative Engine Optimization)
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-Web', allow: '/', disallow },
      { userAgent: 'anthropic-ai', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
      { userAgent: 'Applebot-Extended', allow: '/', disallow },
      { userAgent: 'Bytespider', allow: '/', disallow },
      { userAgent: 'CCBot', allow: '/', disallow },
      { userAgent: 'meta-externalagent', allow: '/', disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
