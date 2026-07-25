import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

/** Layout for all public pages: shared accessible header + footer with sitewide internal links. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <SiteHeader />
      <div id="main-content">{children}</div>
      <SiteFooter />
    </>
  );
}
