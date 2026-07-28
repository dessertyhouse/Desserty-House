import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import {
  emptyMenu,
  normaliseMenu,
  type MenuData,
  type CustomProduct,
  type CustomStyle,
  type ProductOverride,
  type StyleOverride,
} from '@/lib/menu';
import { products as staticProducts } from '@/app/products';

export const runtime = 'nodejs';

const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

async function verifyAdmin(request: NextRequest) {
  const sessionAuth = await verifyAdminSession();
  const headerPassword = request.headers.get('x-admin-password');
  const validPassword =
    !!process.env.ADMIN_DASHBOARD_PASSWORD &&
    headerPassword === process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!sessionAuth && !validPassword) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }
  const rate = checkRateLimit(getClientIP(request), RATE_LIMITS.adminOperations);
  if (!rate.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }
  return null;
}

async function loadMenu(): Promise<MenuData> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'menu')
      .single();
    if (data?.value) return normaliseMenu(data.value);
  } catch {
    /* fall through to empty */
  }
  return { ...emptyMenu, overrides: {}, styleOverrides: {}, extraStyles: {}, custom: [] };
}

async function saveMenu(menu: MenuData, request: NextRequest, action: string, before: unknown) {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'menu', value: menu, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
  await logAuditEvent({
    action: 'post_updated',
    entity_type: 'admin',
    entity_id: `menu:${action}`,
    old_value: before as Record<string, unknown>,
    new_value: menu as unknown as Record<string, unknown>,
    ...createAuditContext(request),
  });
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const txt = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Upload a File to Cloudinary and return { url, public_id }. */
async function uploadImage(file: File, folder: string, alt: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Image must be WebP, JPG or PNG.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be under 8 MB.');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    getCloudinary()
      .uploader.upload_stream(
        { folder, resource_type: 'image', context: { alt } },
        (error, res) => (error || !res ? reject(error || new Error('Upload failed')) : resolve(res as never))
      )
      .end(buffer);
  });
  return { url: result.secure_url, public_id: result.public_id };
}

/** Best-effort Cloudinary cleanup — never blocks the save. */
async function destroyImage(publicId?: string) {
  if (!publicId) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch {
    /* already gone */
  }
}

/* ============================================================
   GET — current menu data + built-in catalog (with styles) for the editor
   ============================================================ */
export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const menu = await loadMenu();
    return NextResponse.json({
      success: true,
      menu,
      builtIn: staticProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        short: p.short,
        description: p.description,
        details: p.details,
        gallery: p.gallery.map((g) => ({
          code: g.code,
          title: g.title,
          description: g.description,
          image: g.image,
        })),
      })),
    });
  } catch (e) {
    console.error('Menu GET error:', e);
    return NextResponse.json({ error: 'Failed to load menu data.' }, { status: 500 });
  }
}

/* ============================================================
   PUT — save category overrides and/or style overrides
   Body: { overrides?, styleOverrides?, order? }
   ============================================================ */
export async function PUT(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const before = await loadMenu();
    const validIds = new Set(staticProducts.map((p) => p.id));
    const menu: MenuData = { ...before };

    /* ---- category-level overrides ---- */
    if (body.overrides && typeof body.overrides === 'object') {
      const incoming = body.overrides as Record<string, ProductOverride>;
      const overrides: Record<string, ProductOverride> = {};
      for (const [id, o] of Object.entries(incoming)) {
        if (!validIds.has(id) || !o || typeof o !== 'object') continue;
        const clean: ProductOverride = {};
        if (txt(o.name, 80)) clean.name = txt(o.name, 80);
        if (txt(o.short, 200)) clean.short = txt(o.short, 200);
        if (txt(o.description, 1000)) clean.description = txt(o.description, 1000);
        if (Array.isArray(o.details)) {
          const details = o.details.map((d) => txt(d, 160)).filter(Boolean).slice(0, 10);
          if (details.length) clean.details = details;
        }
        if (o.hidden) clean.hidden = true;
        if (typeof o.order === 'number' && Number.isFinite(o.order)) clean.order = o.order;
        if (Object.keys(clean).length) overrides[id] = clean;
      }
      menu.overrides = overrides;
    }

    /* ---- style-level overrides (title/description/hidden) ---- */
    if (body.styleOverrides && typeof body.styleOverrides === 'object') {
      const incoming = body.styleOverrides as Record<string, Record<string, StyleOverride>>;
      const result: Record<string, Record<string, StyleOverride>> = {};
      for (const [productId, styles] of Object.entries(incoming)) {
        if (!styles || typeof styles !== 'object') continue;
        const known = validIds.has(productId) || before.custom.some((c) => c.id === productId);
        if (!known) continue;
        const cleanStyles: Record<string, StyleOverride> = {};
        for (const [code, o] of Object.entries(styles)) {
          if (!o || typeof o !== 'object') continue;
          const clean: StyleOverride = {};
          if (txt(o.title, 100)) clean.title = txt(o.title, 100);
          if (txt(o.description, 600)) clean.description = txt(o.description, 600);
          if (o.hidden) clean.hidden = true;
          // Preserve any uploaded replacement image already stored for this style
          const existing = before.styleOverrides[productId]?.[code];
          if (existing?.image_url) {
            clean.image_url = existing.image_url;
            clean.cloudinary_public_id = existing.cloudinary_public_id;
          }
          if (Object.keys(clean).length) cleanStyles[txt(code, 40)] = clean;
        }
        if (Object.keys(cleanStyles).length) result[productId] = cleanStyles;
      }
      menu.styleOverrides = result;
    }

    /* ---- explicit category display order ---- */
    if (Array.isArray(body.order)) {
      const order = body.order.map((x: unknown) => txt(x, 40)).filter(Boolean);
      const overrides = { ...menu.overrides };
      const custom = [...menu.custom];
      order.forEach((id: string, index: number) => {
        if (validIds.has(id)) {
          overrides[id] = { ...overrides[id], order: index };
        } else {
          const ci = custom.findIndex((c) => c.id === id);
          if (ci !== -1) custom[ci] = { ...custom[ci], order: index };
        }
      });
      menu.overrides = overrides;
      menu.custom = custom;
    }

    await saveMenu(menu, request, 'saved', before);
    return NextResponse.json({ success: true, menu });
  } catch (e) {
    console.error('Menu PUT error:', e);
    return NextResponse.json(
      {
        error:
          'Failed to save. Make sure the site_settings table exists (run sql/site-settings-migration.sql).',
      },
      { status: 500 }
    );
  }
}

/* ============================================================
   POST — multipart. Three actions:
     action=category   → add a brand-new category
     action=style      → add an extra style item to a category
     action=style-image→ replace the photo of an existing style item
   (no action = category, for backwards compatibility)
   ============================================================ */
export async function POST(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const action = String(formData.get('action') || 'category');
    const before = await loadMenu();
    const file = formData.get('image') as File | null;

    /* ---------- add a new category ---------- */
    if (action === 'category') {
      const name = txt(formData.get('name'), 80);
      const short = txt(formData.get('short'), 200);
      const description = txt(formData.get('description'), 1000);
      if (!name || !short) {
        return NextResponse.json({ error: 'Name and tagline are required.' }, { status: 400 });
      }
      if (!file || !file.size) {
        return NextResponse.json({ error: 'A product photo is required.' }, { status: 400 });
      }

      let slug = slugify(name) || 'item';
      const taken = new Set([
        ...staticProducts.map((p) => p.slug),
        ...before.custom.map((c) => c.slug),
      ]);
      if (taken.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      const id = `CUS-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      const uploaded = await uploadImage(file, 'Desserty House/custom-products', name);
      const product: CustomProduct = {
        id,
        slug,
        name,
        short,
        description: description || short,
        image_url: uploaded.url,
        cloudinary_public_id: uploaded.public_id,
        order: before.custom.length + staticProducts.length,
        created_at: new Date().toISOString(),
      };

      const menu: MenuData = { ...before, custom: [...before.custom, product] };
      await saveMenu(menu, request, `category-added:${id}`, before);
      return NextResponse.json({ success: true, product, menu });
    }

    /* ---------- add an extra style item inside a category ---------- */
    if (action === 'style') {
      const productId = txt(formData.get('product_id'), 40);
      const title = txt(formData.get('title'), 100);
      const description = txt(formData.get('description'), 600);
      const known =
        staticProducts.some((p) => p.id === productId) ||
        before.custom.some((c) => c.id === productId);
      if (!known) return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
      if (!title) return NextResponse.json({ error: 'A style title is required.' }, { status: 400 });
      if (!file || !file.size) {
        return NextResponse.json({ error: 'A style photo is required.' }, { status: 400 });
      }

      const existing = before.extraStyles[productId] || [];
      const prefix = productId.split('-')[0];
      const code = `${prefix}-X${String(existing.length + 1).padStart(2, '0')}`;

      const uploaded = await uploadImage(file, 'Desserty House/custom-styles', title);
      const style: CustomStyle = {
        code,
        title,
        description: description || `${title} style — customise the details when you order.`,
        image_url: uploaded.url,
        cloudinary_public_id: uploaded.public_id,
        created_at: new Date().toISOString(),
      };

      const menu: MenuData = {
        ...before,
        extraStyles: { ...before.extraStyles, [productId]: [...existing, style] },
      };
      await saveMenu(menu, request, `style-added:${productId}:${code}`, before);
      return NextResponse.json({ success: true, style, menu });
    }

    /* ---------- replace the photo of an existing style ---------- */
    if (action === 'style-image') {
      const productId = txt(formData.get('product_id'), 40);
      const code = txt(formData.get('code'), 40);
      if (!productId || !code) {
        return NextResponse.json({ error: 'Category and style code are required.' }, { status: 400 });
      }
      if (!file || !file.size) {
        return NextResponse.json({ error: 'An image file is required.' }, { status: 400 });
      }

      const uploaded = await uploadImage(file, 'Desserty House/custom-styles', code);

      // An extra (admin-added) style? update it in place.
      const extras = before.extraStyles[productId] || [];
      const extraIdx = extras.findIndex((s) => s.code === code);
      if (extraIdx !== -1) {
        await destroyImage(extras[extraIdx].cloudinary_public_id);
        const updated = [...extras];
        updated[extraIdx] = {
          ...updated[extraIdx],
          image_url: uploaded.url,
          cloudinary_public_id: uploaded.public_id,
        };
        const menu: MenuData = {
          ...before,
          extraStyles: { ...before.extraStyles, [productId]: updated },
        };
        await saveMenu(menu, request, `style-image:${productId}:${code}`, before);
        return NextResponse.json({ success: true, menu });
      }

      // Otherwise it is a built-in style: store the replacement as an override.
      const productStyles = before.styleOverrides[productId] || {};
      await destroyImage(productStyles[code]?.cloudinary_public_id);
      const menu: MenuData = {
        ...before,
        styleOverrides: {
          ...before.styleOverrides,
          [productId]: {
            ...productStyles,
            [code]: {
              ...productStyles[code],
              image_url: uploaded.url,
              cloudinary_public_id: uploaded.public_id,
            },
          },
        },
      };
      await saveMenu(menu, request, `style-image:${productId}:${code}`, before);
      return NextResponse.json({ success: true, menu });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to save.';
    console.error('Menu POST error:', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ============================================================
   PATCH — edit a custom category, or toggle/edit a single style
   ============================================================ */
export async function PATCH(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const before = await loadMenu();

    /* ---- style-level patch ---- */
    if (body.type === 'style') {
      const productId = txt(body.product_id, 40);
      const code = txt(body.code, 40);
      if (!productId || !code) {
        return NextResponse.json({ error: 'Category and style code are required.' }, { status: 400 });
      }

      const extras = before.extraStyles[productId] || [];
      const extraIdx = extras.findIndex((s) => s.code === code);

      if (extraIdx !== -1) {
        const updated = [...extras];
        const item = { ...updated[extraIdx] };
        if (body.title !== undefined) item.title = txt(body.title, 100) || item.title;
        if (body.description !== undefined) item.description = txt(body.description, 600);
        if (body.hidden !== undefined) item.hidden = Boolean(body.hidden);
        updated[extraIdx] = item;
        const menu: MenuData = {
          ...before,
          extraStyles: { ...before.extraStyles, [productId]: updated },
        };
        await saveMenu(menu, request, `style-edited:${productId}:${code}`, before);
        return NextResponse.json({ success: true, menu });
      }

      const productStyles = { ...(before.styleOverrides[productId] || {}) };
      const patch: StyleOverride = { ...productStyles[code] };
      if (body.title !== undefined) patch.title = txt(body.title, 100) || undefined;
      if (body.description !== undefined) patch.description = txt(body.description, 600) || undefined;
      if (body.hidden !== undefined) patch.hidden = Boolean(body.hidden) || undefined;
      // Drop empty overrides entirely so the code default takes over again
      const hasValue = Object.values(patch).some((v) => v !== undefined && v !== '');
      if (hasValue) productStyles[code] = patch;
      else delete productStyles[code];

      const menu: MenuData = {
        ...before,
        styleOverrides: { ...before.styleOverrides, [productId]: productStyles },
      };
      await saveMenu(menu, request, `style-edited:${productId}:${code}`, before);
      return NextResponse.json({ success: true, menu });
    }

    /* ---- custom category patch ---- */
    const id = txt(body.id, 40);
    if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    const idx = before.custom.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Custom product not found.' }, { status: 404 });

    const updated = { ...before.custom[idx] };
    if (body.name !== undefined) updated.name = txt(body.name, 80) || updated.name;
    if (body.short !== undefined) updated.short = txt(body.short, 200) || updated.short;
    if (body.description !== undefined) updated.description = txt(body.description, 1000);
    if (body.hidden !== undefined) updated.hidden = Boolean(body.hidden);
    if (Array.isArray(body.details)) {
      updated.details = body.details.map((d: unknown) => txt(d, 160)).filter(Boolean).slice(0, 10);
    }

    const custom = [...before.custom];
    custom[idx] = updated;
    const menu: MenuData = { ...before, custom };
    await saveMenu(menu, request, `category-edited:${id}`, before);
    return NextResponse.json({ success: true, product: updated, menu });
  } catch (e) {
    console.error('Menu PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update.' }, { status: 500 });
  }
}

/* ============================================================
   DELETE — remove a custom category, an added style, or reset a
   built-in style's uploaded photo back to the Cloudinary default
   ============================================================ */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const before = await loadMenu();

    /* ---- delete / reset a style ---- */
    if (body.type === 'style') {
      const productId = txt(body.product_id, 40);
      const code = txt(body.code, 40);
      if (!productId || !code) {
        return NextResponse.json({ error: 'Category and style code are required.' }, { status: 400 });
      }

      const extras = before.extraStyles[productId] || [];
      const extra = extras.find((s) => s.code === code);
      if (extra) {
        await destroyImage(extra.cloudinary_public_id);
        const menu: MenuData = {
          ...before,
          extraStyles: {
            ...before.extraStyles,
            [productId]: extras.filter((s) => s.code !== code),
          },
        };
        await saveMenu(menu, request, `style-deleted:${productId}:${code}`, before);
        return NextResponse.json({ success: true, menu });
      }

      // Built-in style: remove its override (restores the original photo/text)
      const productStyles = { ...(before.styleOverrides[productId] || {}) };
      await destroyImage(productStyles[code]?.cloudinary_public_id);
      delete productStyles[code];
      const menu: MenuData = {
        ...before,
        styleOverrides: { ...before.styleOverrides, [productId]: productStyles },
      };
      await saveMenu(menu, request, `style-reset:${productId}:${code}`, before);
      return NextResponse.json({ success: true, menu });
    }

    /* ---- delete a custom category ---- */
    const id = txt(body.id, 40);
    if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    const item = before.custom.find((c) => c.id === id);
    if (!item) return NextResponse.json({ error: 'Custom product not found.' }, { status: 404 });

    await destroyImage(item.cloudinary_public_id);
    // also clean up any styles that were added inside it
    for (const s of before.extraStyles[id] || []) await destroyImage(s.cloudinary_public_id);

    const extraStyles = { ...before.extraStyles };
    delete extraStyles[id];
    const styleOverrides = { ...before.styleOverrides };
    delete styleOverrides[id];

    const menu: MenuData = {
      ...before,
      custom: before.custom.filter((c) => c.id !== id),
      extraStyles,
      styleOverrides,
    };
    await saveMenu(menu, request, `category-deleted:${id}`, before);
    return NextResponse.json({ success: true, menu });
  } catch (e) {
    console.error('Menu DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
  }
}
