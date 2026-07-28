import { createClient } from '@supabase/supabase-js';
import { showcase as staticShowcase, type ShowcaseItem } from '@/app/(public)/showcase/data';
import type { ItemLink } from '@/lib/links';

/**
 * Gallery data layer.
 *
 * The 46 original showcase photos stay in code (they live in Cloudinary and
 * are part of the site's SEO), but the admin can now:
 *   - EDIT the title, category and description of any of them
 *   - HIDE any of them from the public gallery
 *   - ADD brand-new gallery photos by uploading an image
 *   - EDIT / HIDE / REMOVE the ones they added
 *
 * Stored in Supabase `site_settings` under key 'gallery'. As everywhere else
 * in this codebase, a missing or unreachable database simply falls back to the
 * code defaults, so the public gallery can never end up blank.
 */

export type GalleryOverride = {
  title?: string;
  category?: string;
  description?: string;
  hidden?: boolean;
  links?: ItemLink[];
  /**
   * Optional replacement photo for a BUILT-IN showcase item.
   * When set, the public gallery renders this instead of the original
   * Cloudinary asset. Clearing the override restores the original, so the
   * built-in photo is never destroyed.
   */
  image_url?: string;
  cloudinary_public_id?: string;
};

export type CustomGalleryItem = {
  code: string; // e.g. DH-SHOW-C1A2B3
  title: string;
  category: string;
  description: string;
  image_url: string;
  cloudinary_public_id?: string;
  hidden?: boolean;
  links?: ItemLink[];
  created_at?: string;
};

export type GalleryData = {
  overrides: Record<string, GalleryOverride>;
  custom: CustomGalleryItem[];
};

export const emptyGallery: GalleryData = { overrides: {}, custom: [] };

/** The categories offered in the admin dropdown (plus anything already in use). */
export const GALLERY_CATEGORIES = [
  'Brownies',
  'Bento Cakes',
  'Birthday Cakes',
  'Fondant Cakes',
  'Cupcakes',
  'Donuts',
  'Bomboloni',
  'Pizza',
  'Other',
];

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/** Normalise any stored shape into a complete GalleryData. */
export function normaliseGallery(value: unknown): GalleryData {
  if (!value || typeof value !== 'object') return { ...emptyGallery };
  const v = value as Partial<GalleryData>;
  return {
    overrides: v.overrides && typeof v.overrides === 'object' ? v.overrides : {},
    custom: Array.isArray(v.custom) ? v.custom : [],
  };
}

/** Load raw gallery admin data with safe fallback. */
export async function getGalleryData(): Promise<GalleryData> {
  try {
    const { data } = await db().from('site_settings').select('value').eq('key', 'gallery').single();
    if (data?.value) return normaliseGallery(data.value);
  } catch {
    /* table missing / unreachable — use code defaults */
  }
  return { ...emptyGallery };
}

/** The built-in 46, with admin edits applied (including hidden flags). */
export function applyOverrides(
  data: GalleryData
): (ShowcaseItem & { hidden?: boolean; links?: ItemLink[] })[] {
  return staticShowcase.map((item) => {
    const o = data.overrides[item.code];
    if (!o) return item;
    return {
      ...item,
      title: o.title?.trim() || item.title,
      category: o.category?.trim() || item.category,
      description: o.description?.trim() || item.description,
      // An admin-uploaded replacement wins; otherwise keep the original photo.
      image: o.image_url?.trim() || item.image,
      hidden: !!o.hidden,
      links: Array.isArray(o.links) ? o.links : undefined,
    };
  });
}

/** Admin-added items mapped into the same shape as the built-in ones. */
export function customAsItems(
  data: GalleryData,
  instagram: string
): (ShowcaseItem & { hidden?: boolean; links?: ItemLink[]; custom: true })[] {
  return data.custom.map((c) => ({
    code: c.code,
    category: c.category,
    title: c.title,
    description: c.description,
    image: c.image_url,
    instagram,
    hidden: !!c.hidden,
    links: Array.isArray(c.links) ? c.links : undefined,
    custom: true as const,
  }));
}

/**
 * The public gallery: built-in items with edits applied plus admin-added
 * items, with everything hidden removed. Newest custom items appear first.
 */
export async function getGalleryItems(): Promise<(ShowcaseItem & { links?: ItemLink[] })[]> {
  const data = await getGalleryData();
  const instagram = staticShowcase[0]?.instagram || 'https://www.instagram.com/dessertyhouse/';

  const custom = customAsItems(data, instagram)
    .filter((c) => !c.hidden)
    .reverse();
  const builtIn = applyOverrides(data).filter((i) => !i.hidden);

  return [...custom, ...builtIn];
}

/** Everything including hidden items — used by the admin editor only. */
export async function getGalleryForAdmin() {
  const data = await getGalleryData();
  const instagram = staticShowcase[0]?.instagram || 'https://www.instagram.com/dessertyhouse/';
  return {
    builtIn: applyOverrides(data),
    custom: customAsItems(data, instagram),
    raw: data,
  };
}
