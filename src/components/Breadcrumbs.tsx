import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbSchema } from '../lib/site';

export type Crumb = { name: string; href: string };

/**
 * Accessible breadcrumb navigation + matching BreadcrumbList JSON-LD.
 * Pass the full trail including Home, e.g.
 * <Breadcrumbs items={[{name:'Home',href:'/'},{name:'Products',href:'/products'}]} />
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className="shell breadcrumbs">
        <ol>
          {items.map((it, i) => {
            const last = i === items.length - 1;
            return (
              <li key={it.href}>
                {last ? (
                  <span aria-current="page">{it.name}</span>
                ) : (
                  <Link href={it.href}>{it.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
