import { createClient } from '@supabase/supabase-js';
import { products as staticProducts, type Product } from '../app/products';
import { getSettings } from './settings';

/**
 * Menu master-control data layer.
 *
 * The admin can now fully manage the public menu from the dashboard:
 *  - EDIT the displayed name, tagline and description of any built-in product
 *  - HIDE/SHOW any product (also possible from Website Settings)
 *  - ADD brand-new custom products (with an uploaded photo) — they appear on
 *    the home page, /products, the footer, the order form and get their own
 *    /menu/<slug> page automatically
 *  - REMOVE custom products (built-in products can only be hidden, because
 *    their style galleries live in Cloudinary and their pages are part of SEO)
 *
 * Everything is stored in the Supabase `site_settings` table under key 'menu'.
 */

export type ProductOverride = {
  name?: string;
  short?: string;
  description?: string;
  hidden?: boolean;
};

export type CustomProduct = {
  id: string; // e.g. CUS-3F9A
  slug: string;
  name: string;
  short: string;
  description: string;
  image_url: string;
  cloudinary_public_id?: string;
  hidden?: boolean;
  created_at?: string;
};

export type MenuData = {
  overrides: Record<string, ProductOverride>;
  custom: CustomProduct[];
};

export const emptyMenu: MenuData = { overrides: {}, custom: [] };

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

/** Load raw menu data (overrides + custom products) with safe fallback. */
export async function getMenuData(): Promise<MenuData> {
  try {
    const { data } = await db().from('site_settings').select('value').eq('key', 'menu').single();
    if (data?.value && typeof data.value === 'object') {
      const v = data.value as Partial<MenuData>;
      return {
        overrides: v.overrides && typeof v.overrides === 'object' ? v.overrides : {},
        custom: Array.isArray(v.custom) ? v.custom : [],
      };
    }
  } catch {
    /* table missing / unreachable — use code defaults */
  }
  return emptyMenu;
}

/** A product as shown on the public site (built-in or custom). */
export type MenuProduct = Product & { custom?: boolean };

/**
 * The single source of truth for the public menu:
 * built-in products with admin overrides applied, plus custom products,
 * minus anything hidden (via menu overrides OR Website Settings).
 */
export async function getMenuProducts(): Promise<MenuProduct[]> {
  const [menu, settings] = await Promise.all([getMenuData(), getSettings()]);
  const hiddenSet = new Set(settings.hiddenProducts);

  const builtIn: MenuProduct[] = staticProducts
    .filter((p) => !hiddenSet.has(p.id) && !menu.overrides[p.id]?.hidden)
    .map((p) => {
      const o = menu.overrides[p.id];
      if (!o) return p;
      return {
        ...p,
        name: o.name?.trim() || p.name,
        short: o.short?.trim() || p.short,
        description: o.description?.trim() || p.description,
      };
    });

  const custom: MenuProduct[] = menu.custom
    .filter((c) => !c.hidden && !hiddenSet.has(c.id))
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      short: c.short,
      description: c.description,
      details: ['Made to order — quote confirmed on WhatsApp', 'Egg and eggless options on request'],
      gallery: [
        {
          code: c.id,
          title: c.name,
          description: c.short,
          image: c.image_url,
        },
      ],
      custom: true,
    }));

  return [...builtIn, ...custom];
}

/** Find one visible product by slug (built-in or custom). */
export async function getMenuProduct(slug: string): Promise<MenuProduct | undefined> {
  const all = await getMenuProducts();
  return all.find((p) => p.slug === slug);
}
