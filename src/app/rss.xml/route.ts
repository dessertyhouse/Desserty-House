import { createClient } from '@supabase/supabase-js';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';

const esc = (s: string) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * RSS 2.0 feed served at /rss.xml.
 * Items come from the Supabase `posts` table (the same content shown on /posts),
 * so publishing a post in the admin dashboard automatically updates the feed.
 */
export async function GET() {
  let items: { title: string; description: string; created_at: string; image_url?: string }[] = [];
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const { data } = await db
      .from('posts')
      .select('title,description,created_at,image_url')
      .eq('is_published', true)
      .neq('kind', 'feedback')
      .order('created_at', { ascending: false })
      .limit(30);
    items = data ?? [];
  } catch {
    items = [];
  }

  const xmlItems = items
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}/posts</link>
      <guid isPermaLink="false">${esc(p.title)}-${new Date(p.created_at).getTime()}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>${p.image_url ? `\n      <enclosure url="${esc(p.image_url)}" type="image/jpeg" length="0"/>` : ''}
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)} — Blog &amp; Offers</title>
    <link>${site.url}/posts</link>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(site.description)}</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
