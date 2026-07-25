import type { Metadata } from 'next';

/** Admin area: explicitly excluded from search engines (noindex + robots.txt disallow). */
export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
