import { site } from '@/lib/site';

/**
 * Desserty House logo.
 *
 * The DEFAULT logo is the inline SVG below — a 1:1 badge with a "DH" monogram
 * over a cake silhouette, in the site's brand colours. Being plain .tsx source
 * it commits to GitHub with no binary upload, never 404s, and stays crisp on
 * any screen.
 *
 * The owner can replace it from the admin dashboard (Settings → Brand logo).
 * When a custom logo is uploaded, `logoUrl` is set and we render that image
 * instead; removing it falls straight back to this default.
 *
 * Always square (1:1) so it works as a header mark, an avatar and an app icon.
 */

export function DefaultLogoMark({ size = 44, title }: { size?: number; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      {/* rounded badge */}
      <rect x="1.5" y="1.5" width="61" height="61" rx="16" fill="#2b1712" />
      <rect
        x="4.5"
        y="4.5"
        width="55"
        height="55"
        rx="13"
        fill="none"
        stroke="#c69046"
        strokeWidth="1.5"
        opacity="0.85"
      />

      {/* cake silhouette */}
      <g stroke="#c69046" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* candle flame + stick */}
        <circle cx="32" cy="12.2" r="2.1" fill="#f0c070" stroke="none" />
        <path d="M32 15.4v3.6" />
        {/* top tier — softly rounded, not a box */}
        <path d="M26.2 30.4v-6.2c0-1.9 1.6-3.4 3.5-3.4h4.6c1.9 0 3.5 1.5 3.5 3.4v6.2" />
        {/* bottom tier */}
        <path d="M19 44.2V33.8c0-1.9 1.6-3.4 3.5-3.4h19c1.9 0 3.5 1.5 3.5 3.4v10.4" />
        {/* icing drips across the bottom tier */}
        <path d="M19 36.4c2.2 0 2.2 2.2 4.3 2.2s2.2-2.2 4.3-2.2 2.2 2.2 4.4 2.2 2.2-2.2 4.3-2.2 2.2 2.2 4.3 2.2 2.4-2.2 4.4-2.2" />
        {/* plate */}
        <path d="M14.6 44.2h34.8" />
      </g>

      {/* DH monogram */}
      <text
        x="32"
        y="56.6"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="9"
        fontWeight="700"
        letterSpacing="3"
        fill="#fdeeda"
      >
        DH
      </text>
    </svg>
  );
}

/**
 * Site logo used in the header and footer.
 * Renders the admin-uploaded logo when there is one, otherwise the default mark.
 */
export default function Logo({
  logoUrl,
  size = 44,
  title,
}: {
  logoUrl?: string;
  size?: number;
  title?: string;
}) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={title || `${site.name} logo`}
        width={size}
        height={size}
        className="site-logo-img"
        loading="eager"
        decoding="async"
      />
    );
  }
  return <DefaultLogoMark size={size} title={title} />;
}
