import Link from 'next/link';
import { sanitiseUrl, defaultLabel, isExternal, type ItemLink } from '@/lib/links';
import { IconArrowRight, IconExternal } from './Icons';

/**
 * Renders the admin-added links on a post, feedback item or gallery photo.
 *
 * Links are sanitised again at render time (defence in depth — the API already
 * cleans them on save). External links get target="_blank" plus
 * rel="noopener noreferrer"; internal ones use the Next.js router.
 */
export default function ItemLinks({
  links,
  className = '',
}: {
  links?: ItemLink[] | null;
  className?: string;
}) {
  if (!Array.isArray(links) || links.length === 0) return null;

  const safe = links
    .map((l) => {
      const url = sanitiseUrl(l?.url);
      if (!url) return null;
      return { url, label: String(l?.label || '').trim() || defaultLabel(url) };
    })
    .filter(Boolean) as ItemLink[];

  if (!safe.length) return null;

  return (
    <div className={`item-links ${className}`.trim()}>
      {safe.map((l) =>
        isExternal(l.url) ? (
          <a key={l.url + l.label} href={l.url} target="_blank" rel="noopener noreferrer">
            <span>{l.label}</span>
            <IconExternal size={13} />
          </a>
        ) : (
          <Link key={l.url + l.label} href={l.url}>
            <span>{l.label}</span>
            <IconArrowRight size={14} />
          </Link>
        )
      )}
    </div>
  );
}
