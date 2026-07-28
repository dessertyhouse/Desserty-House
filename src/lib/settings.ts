import { createClient } from '@supabase/supabase-js';
import { site } from './site';

/**
 * Editable website settings — the admin can change these live from the
 * dashboard (Website Settings tab) without touching code or redeploying.
 * Values are stored in the Supabase `site_settings` table (key 'site')
 * and merged over the defaults from src/lib/site.ts.
 */
export type SiteSettings = {
  phoneDigits: string;      // e.g. 918939411490 (country code + number, digits only)
  phoneDisplay: string;     // e.g. +91 89394 11490
  email: string;
  instagram: string;
  announcement: string;     // optional banner shown at the top of every page ('' = hidden)
  deliveryAreas: string[];  // shown in footer/contact + schema
  hoursText: string;        // human-readable hours for header/contact display
  hiddenProducts: string[]; // product IDs (e.g. ['PIZ-001']) temporarily hidden from the menu
  heroTitle: string;        // home page main heading ('' = default)
  heroSubtitle: string;     // home page sub-heading ('' = default)
  logoUrl: string;          // custom 1:1 logo ('' = use the built-in default mark)
  logoPublicId: string;     // Cloudinary id, so removing the logo can delete the file
};

export const defaultSettings: SiteSettings = {
  phoneDigits: site.phone.replace(/\D/g, ''),
  phoneDisplay: site.phoneDisplay,
  email: site.email,
  instagram: site.instagram,
  announcement: '',
  deliveryAreas: [...site.areaServed],
  hoursText: 'Mon–Sat 9:00–20:00 · Sun 10:00–18:00',
  hiddenProducts: [],
  heroTitle: '',
  heroSubtitle: '',
  logoUrl: '',
  logoPublicId: '',
};

/** Server-side fetch of settings with safe fallback to defaults. */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const { data } = await db.from('site_settings').select('value').eq('key', 'site').single();
    if (data?.value && typeof data.value === 'object') {
      return { ...defaultSettings, ...(data.value as Partial<SiteSettings>) };
    }
  } catch {
    /* table missing or db unreachable — fall back to code defaults */
  }
  return defaultSettings;
}

/** WhatsApp deep links derived from the editable phone number. */
export const waLink = (s: SiteSettings) => `https://wa.me/${s.phoneDigits}`;
export const waOrderLink = (s: SiteSettings) =>
  `https://wa.me/${s.phoneDigits}?text=Hello%20Desserty%20House%2C%20I%20would%20like%20to%20place%20an%20order.`;
