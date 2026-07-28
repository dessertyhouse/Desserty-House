import type { ReactNode, SVGProps } from 'react';

/**
 * Desserty House icon set — inline SVG React components.
 *
 * Why inline SVG (and not image files or an icon font)?
 *  - Committed as plain .tsx source, so GitHub accepts it with zero binary uploads.
 *  - No extra network requests, no Cloudinary dependency, no layout shift.
 *  - Every icon inherits `currentColor`, so it recolours automatically with the
 *    surrounding text/theme (cream on the dark hero, chocolate on light cards).
 *  - Works with the strict Content-Security-Policy in next.config.ts.
 *
 * Usage:
 *   import { IconPizza } from '@/components/Icons';
 *   <IconPizza size={22} />                       // decorative (aria-hidden)
 *   <IconPizza size={22} title="Pizza" />         // meaningful (role="img" + <title>)
 *
 * All icons are drawn on a 24x24 grid with a 1.6 stroke, round caps/joins.
 */

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Rendered width & height in px (default 20). */
  size?: number | string;
  /** Accessible name. Omit for purely decorative icons. */
  title?: string;
};

/** Shared SVG wrapper: handles sizing, stroke defaults and accessibility. */
function Icon({ size = 20, title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ============================================================
   PRODUCT / FOOD ICONS
   ============================================================ */

export const IconCake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.4v2.6" />
    <path d="M3.6 20.6h16.8" />
    <path d="M5.2 20.6v-6.1c0-1 .8-1.8 1.8-1.8h10c1 0 1.8.8 1.8 1.8v6.1" />
    <path d="M5.2 16.1c1.1 0 1.1 1.1 2.2 1.1s1.1-1.1 2.2-1.1 1.1 1.1 2.3 1.1 1.1-1.1 2.2-1.1 1.1 1.1 2.2 1.1 1.2-1.1 2.7-1.1" />
    <path d="M8.6 12.7V10c0-1 .8-1.8 1.8-1.8h3.2c1 0 1.8.8 1.8 1.8v2.7" />
  </Icon>
);

export const IconBrownie = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.4 8.4 12 4.6l8.6 3.8L12 12.2z" />
    <path d="M3.4 8.4v6.4L12 18.6l8.6-3.8V8.4" />
    <path d="M12 12.2v6.4" />
    <path d="M9.4 9.1c.5.5.4 1.2-.2 1.5" />
    <path d="M14.7 9.9c.6.3.7 1 .2 1.5" />
  </Icon>
);

export const IconPizza = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.8 3.5 19.4a1 1 0 0 0 1.3 1.3L12 17.5l7.2 3.2a1 1 0 0 0 1.3-1.3z" />
    <path d="M6.6 13.2c3.4-1.6 7.4-1.6 10.8 0" />
    <circle cx="10.2" cy="9.6" r=".95" />
    <circle cx="13.7" cy="16.2" r=".95" />
    <circle cx="9" cy="16.8" r=".95" />
  </Icon>
);

export const IconDonut = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <circle cx="12" cy="12" r="2.9" />
    <path d="M12 5.2v1.3" />
    <path d="M17.1 8.8l-1.1.7" />
    <path d="M18.6 14.3l-1.3-.3" />
    <path d="M8.1 17.7l-.8 1" />
    <path d="M15.6 18.2l.6 1" />
    <path d="M6.1 9.6l1.2.6" />
    <path d="M5.7 15.1l1.3-.5" />
  </Icon>
);

export const IconCupcake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.9 11.3h12.2l-1.4 8a1.6 1.6 0 0 1-1.6 1.3H8.9a1.6 1.6 0 0 1-1.6-1.3z" />
    <path d="M5.9 11.3a3.1 3.1 0 0 1 2.2-4.4 3.6 3.6 0 0 1 7-.3 3 3 0 0 1 3 4.7" />
    <path d="M10.2 11.5 9.4 20.4" />
    <path d="M13.8 11.5l.8 8.9" />
    <path d="M12 2.6v1.6" />
  </Icon>
);

export const IconBento = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.2" y="8.2" width="17.6" height="11.6" rx="2.2" />
    <path d="M3.2 12.3h17.6" />
    <path d="M12 8.2v11.6" />
    <path d="M9 8.2c-1.6 0-2.6-1-2.6-2.1S7.4 4 8.7 4C10.4 4 11.4 6 12 8.2 12.6 6 13.6 4 15.3 4c1.3 0 2.3.9 2.3 2.1S16.6 8.2 15 8.2" />
  </Icon>
);

export const IconBomboloni = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="13.6" r="7.6" />
    <path d="M6.6 8.7c1.6-1.9 3.4-2.8 5.4-2.8" />
    <path d="M9.6 12.2c.6-.8 1.5-1.2 2.4-1.2 1 0 1.9.4 2.5 1.2" />
    <path d="M8.4 4.7l.5 1.2" />
    <path d="M15.4 4.9l-.4 1.2" />
    <path d="M12 3.3v1.2" />
  </Icon>
);

export const IconFondant = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20.6h16" />
    <path d="M6 20.6v-5.4c0-.9.7-1.6 1.6-1.6h8.8c.9 0 1.6.7 1.6 1.6v5.4" />
    <path d="M9 13.6v-2.4c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6v2.4" />
    <circle cx="12" cy="5.6" r="2.1" />
    <path d="M12 7.7v1.9" />
    <path d="M7.4 17.2h9.2" />
  </Icon>
);

export const IconBirthdayCake = IconCake;

/* ============================================================
   TRUST / FEATURE ICONS
   ============================================================ */

export const IconEgg = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.9c3.4 0 6.1 4.8 6.1 8.9a6.1 6.1 0 1 1-12.2 0C5.9 7.7 8.6 2.9 12 2.9z" />
    <path d="M9.1 14.8a3.2 3.2 0 0 0 3.1 2.4" />
  </Icon>
);

export const IconLeaf = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.4 19.8C2.8 15 5.6 6.3 19.7 4.2c1.1 9.4-4.6 15.6-9.9 15.6-2.1 0-4-1-5.4-2.1z" />
    <path d="M9 15.3c1.6-3.2 4.2-5.8 7.8-7.4" />
  </Icon>
);

export const IconTruck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.8 6.6h10.4v9.2H2.8z" />
    <path d="M13.2 9.8h3.6l3.4 3.2v2.8h-7z" />
    <circle cx="6.9" cy="18" r="2.1" />
    <circle cx="16.6" cy="18" r="2.1" />
    <path d="M9 18h5.5" />
    <path d="M2.8 15.8h2" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 6.9V12l3.4 2" />
  </Icon>
);

export const IconChefHat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.3 17.2c-2.1-.5-3.6-2.3-3.6-4.5a4.5 4.5 0 0 1 3.6-4.4 4.7 4.7 0 0 1 9-1.2 4.2 4.2 0 0 1 2.4 7.9v2.2" />
    <path d="M6.3 13.9v6.2h11.4v-6.2" />
    <path d="M6.3 17.4h11.4" />
  </Icon>
);

export const IconHeart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20.4 4.7 13.3a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l.6.6.6-.6a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6z" />
  </Icon>
);

export const IconSparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.1 13.7 9l5.9 1.7-5.9 1.7L12 18.3l-1.7-5.9L4.4 10.7 10.3 9z" />
    <path d="M18.8 16.6l.7 2.2 2.2.7-2.2.7-.7 2.2-.7-2.2-2.2-.7 2.2-.7z" />
  </Icon>
);

export const IconStar = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p}>
    <path
      d="M12 3.4l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.8l6-.9z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </Icon>
);

export const IconShield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 2.9 4.4 6.1v5.4c0 4.6 3.1 8.4 7.6 9.6 4.5-1.2 7.6-5 7.6-9.6V6.1z" />
    <path d="M8.9 12.1l2.2 2.2 4-4.3" />
  </Icon>
);

export const IconRupee = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M9 7.6h6" />
    <path d="M9 10.5h6" />
    <path d="M9 16.7l4.2-3.1c1.6-1.2.8-3.1-1.2-3.1H9" />
  </Icon>
);

/* ============================================================
   CONTACT / SOCIAL ICONS
   ============================================================ */

export const IconWhatsApp = ({ size = 20, title, ...rest }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="currentColor"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    focusable="false"
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22.3c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6c-.9-1.5-1.4-3.2-1.4-4.9 0-5.4 4.4-9.7 9.7-9.7s9.7 4.4 9.7 9.7-4.3 9.3-9.7 9.3zm5.3-7c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

export const IconInstagram = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.6" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.1" cy="6.9" r=".9" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconPhone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.8 16.9v2.6a1.8 1.8 0 0 1-2 1.8 17.7 17.7 0 0 1-7.7-2.7 17.4 17.4 0 0 1-5.4-5.4A17.7 17.7 0 0 1 3 5.4a1.8 1.8 0 0 1 1.8-2h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.7 2.5a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14.3 14.3 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.6 2.5.7a1.8 1.8 0 0 1 1.5 1.9z" />
  </Icon>
);

export const IconMail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.9" y="4.9" width="18.2" height="14.2" rx="2.2" />
    <path d="m3.4 6.6 8.6 6 8.6-6" />
  </Icon>
);

export const IconMapPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.4 10.4c0 5.7-7.4 10.7-7.4 10.7s-7.4-5-7.4-10.7a7.4 7.4 0 0 1 14.8 0z" />
    <circle cx="12" cy="10.2" r="2.7" />
  </Icon>
);

export const IconHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10.3 12 3.4l8.5 6.9" />
    <path d="M5.6 12v8.4h12.8V12" />
    <path d="M10 20.4v-5.1h4v5.1" />
  </Icon>
);

/* ============================================================
   UI / ACTION ICONS
   ============================================================ */

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.4 12h15.2" />
    <path d="m13.6 6 6 6-6 6" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 9 6.5 6.5L18.5 9" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.9" cy="10.9" r="7.1" />
    <path d="m16.2 16.2 4.4 4.4" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.8v14.4" />
    <path d="M4.8 12h14.4" />
  </Icon>
);

export const IconX = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.8 12.6 4.8 4.8 9.6-10.8" />
  </Icon>
);

export const IconCheckCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="m8.2 12.2 2.6 2.6 5-5.4" />
  </Icon>
);

export const IconPencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.2 3.9a2.3 2.3 0 0 1 3.2 3.2L8.1 18.4l-4.3 1.1 1.1-4.3z" />
    <path d="m14.6 5.5 3.2 3.2" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.9 6.4h16.2" />
    <path d="M8.4 6.4V4.8a1.6 1.6 0 0 1 1.6-1.6h4a1.6 1.6 0 0 1 1.6 1.6v1.6" />
    <path d="M6.3 6.4v13a1.8 1.8 0 0 0 1.8 1.8h7.8a1.8 1.8 0 0 0 1.8-1.8v-13" />
    <path d="M10.2 10.6v6.2" />
    <path d="M13.8 10.6v6.2" />
  </Icon>
);

export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.9 12S5.6 5.2 12 5.2 22.1 12 22.1 12 18.4 18.8 12 18.8 1.9 12 1.9 12z" />
    <circle cx="12" cy="12" r="3.1" />
  </Icon>
);

export const IconEyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.6 5.6A9.6 9.6 0 0 1 12 5.2c6.4 0 10.1 6.8 10.1 6.8a18.3 18.3 0 0 1-2.9 3.9" />
    <path d="M6.3 6.7A18.1 18.1 0 0 0 1.9 12S5.6 18.8 12 18.8a9.7 9.7 0 0 0 4-.8" />
    <path d="M10 10a2.9 2.9 0 0 0 4 4" />
    <path d="m3.4 3.4 17.2 17.2" />
  </Icon>
);

export const IconSave = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.8 3.9h11l4.3 4.3v11a.9.9 0 0 1-.9.9H4.8a.9.9 0 0 1-.9-.9V4.8a.9.9 0 0 1 .9-.9z" />
    <path d="M7.4 3.9v5.3h7.9V3.9" />
    <path d="M7.4 20.1v-5.6h9.2v5.6" />
  </Icon>
);

export const IconRefresh = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.4 11.2a8.5 8.5 0 0 0-14.6-4.4L3.6 9" />
    <path d="M3.6 12.8a8.5 8.5 0 0 0 14.6 4.4l2.2-2.2" />
    <path d="M3.6 4.4V9h4.6" />
    <path d="M20.4 19.6V15h-4.6" />
  </Icon>
);

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.9" />
    <path d="M19.1 14.6a1.6 1.6 0 0 0 .3 1.7l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.4v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.4-1h-.2a1.9 1.9 0 0 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.4v-.2a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.7v.1a1.6 1.6 0 0 0 1.4 1h.2a1.9 1.9 0 0 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </Icon>
);

export const IconLayers = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3 9 4.7-9 4.7-9-4.7z" />
    <path d="m3 12.4 9 4.7 9-4.7" />
    <path d="m3 16.9 9 4.7 9-4.7" />
  </Icon>
);

export const IconClipboard = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 4.3H7.3a1.8 1.8 0 0 0-1.8 1.8v13a1.8 1.8 0 0 0 1.8 1.8h9.4a1.8 1.8 0 0 0 1.8-1.8v-13a1.8 1.8 0 0 0-1.8-1.8H15" />
    <rect x="9" y="2.7" width="6" height="3.6" rx="1.1" />
    <path d="M8.8 11.5h6.4" />
    <path d="M8.8 15.3h4.4" />
  </Icon>
);

export const IconNewspaper = (p: IconProps) => (
  <Icon {...p}>
    <path d="M17.6 20.4H4.9a1.8 1.8 0 0 1-1.8-1.8V5.4h14.5z" />
    <path d="M17.6 8.9h2.1a1.2 1.2 0 0 1 1.2 1.2v8.5a1.8 1.8 0 0 1-3.6 0" />
    <path d="M6.4 9h8" />
    <path d="M6.4 12.4h8" />
    <path d="M6.4 15.8h5" />
  </Icon>
);

export const IconMegaphone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.6 10.2v3.6a1.6 1.6 0 0 0 1.6 1.6h2.3l7.9 4.6V5.6l-7.9 4.6H5.2a1.6 1.6 0 0 0-1.6 1.6z" />
    <path d="M18.6 9.3a4 4 0 0 1 0 5.4" />
    <path d="M7.5 15.4v3.4a1.6 1.6 0 0 0 3.2 0v-1.5" />
  </Icon>
);

export const IconHelpCircle = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M9.6 9.4a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 2.5-2.5 2.5" />
    <path d="M12 16.6h.01" />
  </Icon>
);

export const IconQuote = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.2 6.8C6.4 8 4.9 10.2 4.9 13.1v4.1h5.4v-5.4H7.6c0-1.7.8-2.9 2.4-3.6z" />
    <path d="M19.1 6.8c-2.8 1.2-4.3 3.4-4.3 6.3v4.1h5.4v-5.4h-2.7c0-1.7.8-2.9 2.4-3.6z" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8.1" r="3.9" />
    <path d="M4.6 20.4a7.6 7.6 0 0 1 14.8 0" />
  </Icon>
);

export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4.6" y="10.4" width="14.8" height="10" rx="2.1" />
    <path d="M8.2 10.4V7.6a3.8 3.8 0 0 1 7.6 0v2.8" />
    <path d="M12 14.6v2.1" />
  </Icon>
);

export const IconLogout = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.4 20.4H5.6a1.8 1.8 0 0 1-1.8-1.8V5.4a1.8 1.8 0 0 1 1.8-1.8h3.8" />
    <path d="m15.4 16.4 4.4-4.4-4.4-4.4" />
    <path d="M19.8 12H9.4" />
  </Icon>
);

export const IconUpload = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.4 15.4v3.4a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8v-3.4" />
    <path d="m16.4 8 -4.4-4.4L7.6 8" />
    <path d="M12 3.6v11.8" />
  </Icon>
);

export const IconImage = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
    <circle cx="8.7" cy="9.5" r="1.7" />
    <path d="m3.9 17.4 4.9-4.6a1.8 1.8 0 0 1 2.5 0l6.1 5.8" />
    <path d="m14.6 14.4 1.6-1.5a1.8 1.8 0 0 1 2.5 0l1.9 1.8" />
  </Icon>
);

export const IconAlert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.5 3.9 2.4 18a1.7 1.7 0 0 0 1.5 2.6h16.2a1.7 1.7 0 0 0 1.5-2.6L13.5 3.9a1.7 1.7 0 0 0-3 0z" />
    <path d="M12 9.4v4.1" />
    <path d="M12 17.1h.01" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 15.9v-4.4" />
    <path d="M12 8.2h.01" />
  </Icon>
);

export const IconCalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.1" />
    <path d="M3.6 10.1h16.8" />
    <path d="M8.2 3.6v3.4" />
    <path d="M15.8 3.6v3.4" />
  </Icon>
);

export const IconTag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11.3 3.5H4.6A1.1 1.1 0 0 0 3.5 4.6v6.7a1.1 1.1 0 0 0 .3.8l8.4 8.4a1.1 1.1 0 0 0 1.6 0l6.7-6.7a1.1 1.1 0 0 0 0-1.6l-8.4-8.4a1.1 1.1 0 0 0-.8-.3z" />
    <circle cx="7.7" cy="7.7" r="1.2" />
  </Icon>
);

export const IconGrid = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
  </Icon>
);

export const IconMenuBars = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.8 6.6h16.4" />
    <path d="M3.8 12h16.4" />
    <path d="M3.8 17.4h16.4" />
  </Icon>
);

export const IconExternal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.2 3.8h6v6" />
    <path d="M10.4 13.6 20.2 3.8" />
    <path d="M18.4 13.6v5a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V7.4a1.8 1.8 0 0 1 1.8-1.8h5" />
  </Icon>
);

export const IconChart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.8 20.2h16.4" />
    <path d="M7.2 20.2v-6.4" />
    <path d="M12 20.2V6.6" />
    <path d="M16.8 20.2v-9.4" />
  </Icon>
);

export const IconTrackPackage = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.4 8.4 12 3.6 3.6 8.4v7.2L12 20.4l8.4-4.8z" />
    <path d="m3.6 8.4 8.4 4.8 8.4-4.8" />
    <path d="M12 13.2v7.2" />
  </Icon>
);

/* ============================================================
   HELPERS
   ============================================================ */

/** Icon lookup by product slug — used on menu cards, footer and order form. */
export function ProductIcon({ slug, ...props }: IconProps & { slug: string }) {
  const key = slug.toLowerCase();
  if (key.includes('brownie')) return <IconBrownie {...props} />;
  if (key.includes('pizza')) return <IconPizza {...props} />;
  if (key.includes('bento')) return <IconBento {...props} />;
  if (key.includes('fondant')) return <IconFondant {...props} />;
  if (key.includes('bomboloni')) return <IconBomboloni {...props} />;
  if (key.includes('cupcake')) return <IconCupcake {...props} />;
  if (key.includes('donut') || key.includes('doughnut')) return <IconDonut {...props} />;
  if (key.includes('cake')) return <IconCake {...props} />;
  return <IconSparkle {...props} />;
}

/** Named icon lookup — lets admin-editable content reference an icon by name. */
export const iconByName: Record<string, (p: IconProps) => React.JSX.Element> = {
  cake: IconCake,
  brownie: IconBrownie,
  pizza: IconPizza,
  donut: IconDonut,
  cupcake: IconCupcake,
  bento: IconBento,
  bomboloni: IconBomboloni,
  fondant: IconFondant,
  egg: IconEgg,
  leaf: IconLeaf,
  truck: IconTruck,
  clock: IconClock,
  chef: IconChefHat,
  heart: IconHeart,
  sparkle: IconSparkle,
  shield: IconShield,
  rupee: IconRupee,
  whatsapp: IconWhatsApp,
  instagram: IconInstagram,
  phone: IconPhone,
  mail: IconMail,
  pin: IconMapPin,
  calendar: IconCalendar,
  tag: IconTag,
  check: IconCheckCircle,
  star: IconStar,
};

/** Render an icon chosen by name in admin-editable content, with a safe fallback. */
export function NamedIcon({ name, ...props }: IconProps & { name: string }) {
  const Cmp = iconByName[(name || '').toLowerCase()] || IconSparkle;
  return <Cmp {...props} />;
}

/** The icon names an admin may pick from in the dashboard dropdowns. */
export const ICON_CHOICES = Object.keys(iconByName);
