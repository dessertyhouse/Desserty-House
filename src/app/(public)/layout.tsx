import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getSettings, waOrderLink } from '@/lib/settings';

/**
 * Layout for all public pages: shared accessible header + footer.
 * Re-rendered at most every 60 seconds (ISR), so admin "Website Settings"
 * changes (announcement banner, phone, email, hidden products…) go live
 * within a minute while pages stay fast and cacheable.
 */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {settings.announcement ? (
        <p className="announce-bar" role="status">{settings.announcement}</p>
      ) : null}
      <SiteHeader settings={settings} />
      <div id="main-content">{children}</div>
      <SiteFooter settings={settings} />
      {/* Floating WhatsApp button — primary conversion action, always reachable on mobile */}
      <a
        href={waOrderLink(settings)}
        rel="noopener"
        className="wa-float"
        aria-label="Chat with us on WhatsApp to order"
      >
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" fill="currentColor">
          <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.3c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6c-.9-1.5-1.4-3.2-1.4-4.9 0-5.4 4.4-9.7 9.7-9.7s9.7 4.4 9.7 9.7-4.3 9.3-9.7 9.3zm5.3-7c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/>
        </svg>
        <span>Order on WhatsApp</span>
      </a>
    </>
  );
}
