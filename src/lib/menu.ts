import { createClient } from '@supabase/supabase-js';
import { products as staticProducts, type Product, type Style } from '../app/products';
import { getSettings } from './settings';

/**
 * Menu master-control data layer.
 *
 * The admin can fully manage the public menu from the dashboard:
 *
 *  CATEGORY LEVEL
 *   - EDIT displayed name, tagline, description and the "Made for your moment"
 *     bullet points of any built-in product category
 *   - HIDE / SHOW any category
 *   - REORDER categories
 *   - ADD brand-new categories (with an uploaded photo) — they appear on the
 *     home page, /products, the footer, the order form and get their own
 *     /menu/<slug> page automatically
 *   - REMOVE custom categories (built-in ones can only be hidden, because their
 *     style galleries live in Cloudinary and their pages are part of SEO)
 *
 *  STYLE / ITEM LEVEL (inside a category)
 *   - EDIT the title and description of any of the ten built-in style items
 *   - REPLACE a style item's photo with an uploaded image
 *   - HIDE any style item (e.g. a flavour that is off the menu this month)
 *   - ADD extra style items to any category, with their own photo and code
 *   - REMOVE the extra style items that were added
 *
 * Everything is stored in the Supabase `site_settings` table under key 'menu',
 * and every read falls back safely to the code defaults if the database is
 * empty or unreachable, so the website never breaks.
 */

export type ProductOverride = {
  name?: string;
  short?: string;
  description?: string;
  details?: string[];
  hidden?: boolean;
  order?: number;
};

/** Edits applied to one built-in style item, keyed by its style code (e.g. BRW-03). */
export type StyleOverride = {
  title?: string;
  description?: string;
  image_url?: string;
  cloudinary_public_id?: string;
  hidden?: boolean;
};

/** A brand-new style item added by the admin inside an existing category. */
export type CustomStyle = {
  code: string;
  title: string;
  description: string;
  image_url: string;
  cloudinary_public_id?: string;
  hidden?: boolean;
  created_at?: string;
};

export type CustomProduct = {
  id: string; // e.g. CUS-3F9A
  slug: string;
  name: string;
  short: string;
  description: string;
  details?: string[];
  image_url: string;
  cloudinary_public_id?: string;
  hidden?: boolean;
  order?: number;
  created_at?: string;
};

export type MenuData = {
  /** productId -> category-level edits */
  overrides: Record<string, ProductOverride>;
  /** productId -> styleCode -> style-level edits */
  styleOverrides: Record<string, Record<string, StyleOverride>>;
  /** productId -> extra style items added by the admin */
  extraStyles: Record<string, CustomStyle[]>;
  /** brand-new categories added by the admin */
  custom: CustomProduct[];
};

export const emptyMenu: MenuData = {
  overrides: {},
  styleOverrides: {},
  extraStyles: {},
  custom: [],
};

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/** Normalise any stored shape (including older saves) into a complete MenuData. */
export function normaliseMenu(value: unknown): MenuData {
  if (!value || typeof value !== 'object') return { ...emptyMenu };
  const v = value as Partial<MenuData>;
  return {
    overrides: v.overrides && typeof v.overrides === 'object' ? v.overrides : {},
    styleOverrides:
      v.styleOverrides && typeof v.styleOverrides === 'object' ? v.styleOverrides : {},
    extraStyles: v.extraStyles && typeof v.extraStyles === 'object' ? v.extraStyles : {},
    custom: Array.isArray(v.custom) ? v.custom : [],
  };
}

/** Load raw menu data with safe fallback. */
export async function getMenuData(): Promise<MenuData> {
  try {
    const { data } = await db().from('site_settings').select('value').eq('key', 'menu').single();
    if (data?.value) return normaliseMenu(data.value);
  } catch {
    /* table missing / unreachable — use code defaults */
  }
  return { ...emptyMenu };
}

/** A product as shown on the public site (built-in or custom). */
export type MenuProduct = Product & { custom?: boolean };

/** Apply style-level overrides, drop hidden styles and append admin-added styles. */
function buildGallery(productId: string, base: Style[], menu: MenuData): Style[] {
  const overrides = menu.styleOverrides[productId] || {};
  const edited = base
    .filter((s) => !overrides[s.code]?.hidden)
    .map((s) => {
      const o = overrides[s.code];
      if (!o) return s;
      return {
        code: s.code,
        title: o.title?.trim() || s.title,
        description: o.description?.trim() || s.description,
        image: o.image_url?.trim() || s.image,
      };
    });

  const extras = (menu.extraStyles[productId] || [])
    .filter((s) => !s.hidden)
    .map((s) => ({
      code: s.code,
      title: s.title,
      description: s.description,
      image: s.image_url,
    }));

  return [...edited, ...extras];
}

/**
 * The single source of truth for the public menu:
 * built-in products with admin overrides applied, plus custom products,
 * minus anything hidden (via menu overrides OR Website Settings),
 * sorted by the admin's chosen order.
 */
export async function getMenuProducts(): Promise<MenuProduct[]> {
  const [menu, settings] = await Promise.all([getMenuData(), getSettings()]);
  const hiddenSet = new Set(settings.hiddenProducts);

  const builtIn: MenuProduct[] = staticProducts
    .filter((p) => !hiddenSet.has(p.id) && !menu.overrides[p.id]?.hidden)
    .map((p) => {
      const o = menu.overrides[p.id];
      const gallery = buildGallery(p.id, p.gallery, menu);
      return {
        ...p,
        name: o?.name?.trim() || p.name,
        short: o?.short?.trim() || p.short,
        description: o?.description?.trim() || p.description,
        details: o?.details?.length ? o.details : p.details,
        // never ship an empty gallery — fall back to the original photos
        gallery: gallery.length ? gallery : p.gallery,
      };
    });

  const custom: MenuProduct[] = menu.custom
    .filter((c) => !c.hidden && !hiddenSet.has(c.id))
    .map((c) => {
      const gallery = buildGallery(
        c.id,
        [{ code: c.id, title: c.name, description: c.short, image: c.image_url }],
        menu
      );
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        short: c.short,
        description: c.description,
        details: c.details?.length
          ? c.details
          : ['Made to order — quote confirmed on WhatsApp', 'Egg and eggless options on request'],
        gallery: gallery.length
          ? gallery
          : [{ code: c.id, title: c.name, description: c.short, image: c.image_url }],
        custom: true,
      };
    });

  const all = [...builtIn, ...custom];

  // Admin-defined display order; anything without an explicit order keeps its
  // natural position after the explicitly ordered items.
  const orderOf = (p: MenuProduct) => {
    const explicit = p.custom
      ? menu.custom.find((c) => c.id === p.id)?.order
      : menu.overrides[p.id]?.order;
    return typeof explicit === 'number' ? explicit : 1000 + all.indexOf(p);
  };

  return all.sort((a, b) => orderOf(a) - orderOf(b));
}

/** Find one visible product by slug (built-in or custom). */
export async function getMenuProduct(slug: string): Promise<MenuProduct | undefined> {
  const all = await getMenuProducts();
  return all.find((p) => p.slug === slug);
}
