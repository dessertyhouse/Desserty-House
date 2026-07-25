import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { emptyMenu, type MenuData, type CustomProduct, type ProductOverride } from '@/lib/menu';
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
  const validPassword = headerPassword === process.env.ADMIN_DASHBOARD_PASSWORD;
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
  const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', 'menu').single();
  if (data?.value && typeof data.value === 'object') {
    const v = data.value as Partial<MenuData>;
    return {
      overrides: v.overrides && typeof v.overrides === 'object' ? v.overrides : {},
      custom: Array.isArray(v.custom) ? v.custom : [],
    };
  }
  return { ...emptyMenu, overrides: {}, custom: [] };
}

async function saveMenu(menu: MenuData, request: NextRequest, action: string, before: unknown) {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'menu', value: menu, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
  await logAuditEvent({
    action: 'post_updated' as any,
    entity_type: 'admin',
    entity_id: `menu:${action}`,
    old_value: before as any,
    new_value: menu as any,
    ...createAuditContext(request),
  });
}

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** GET — current menu data plus the built-in catalog for the editor UI. */
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
      })),
    });
  } catch (e) {
    console.error('Menu GET error:', e);
    return NextResponse.json({ error: 'Failed to load menu data.' }, { status: 500 });
  }
}

/** PUT — save overrides for built-in products (name/short/description/hidden). */
export async function PUT(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const incoming = (body.overrides ?? {}) as Record<string, ProductOverride>;
    const validIds = new Set(staticProducts.map((p) => p.id));

    const overrides: Record<string, ProductOverride> = {};
    for (const [id, o] of Object.entries(incoming)) {
      if (!validIds.has(id) || !o || typeof o !== 'object') continue;
      const clean: ProductOverride = {};
      if (o.name?.trim()) clean.name = String(o.name).trim().slice(0, 80);
      if (o.short?.trim()) clean.short = String(o.short).trim().slice(0, 200);
      if (o.description?.trim()) clean.description = String(o.description).trim().slice(0, 1000);
      if (o.hidden) clean.hidden = true;
      if (Object.keys(clean).length) overrides[id] = clean;
    }

    const before = await loadMenu();
    const menu: MenuData = { ...before, overrides };
    await saveMenu(menu, request, 'overrides-saved', before);
    return NextResponse.json({ success: true, menu });
  } catch (e) {
    console.error('Menu PUT error:', e);
    return NextResponse.json(
      { error: 'Failed to save. Make sure the site_settings table exists (run sql/site-settings-migration.sql).' },
      { status: 500 }
    );
  }
}

/** POST — add a new custom product (multipart form with image). */
export async function POST(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const name = String(formData.get('name') || '').trim();
    const short = String(formData.get('short') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const file = formData.get('image') as File | null;

    if (!name || !short) {
      return NextResponse.json({ error: 'Name and tagline are required.' }, { status: 400 });
    }
    if (!file || !file.size) {
      return NextResponse.json({ error: 'A product photo is required.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Image must be WebP, JPG or PNG.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image must be under 8 MB.' }, { status: 400 });
    }

    const before = await loadMenu();

    // Unique slug: avoid clashing with built-in slugs and other custom products
    let slug = slugify(name) || 'item';
    const taken = new Set([...staticProducts.map((p) => p.slug), ...before.custom.map((c) => c.slug)]);
    if (taken.has(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const id = `CUS-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    // Upload image to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise<any>((resolve, reject) => {
      getCloudinary()
        .uploader.upload_stream(
          { folder: 'Desserty House/custom-products', resource_type: 'image', context: { alt: name } },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    const product: CustomProduct = {
      id,
      slug,
      name: name.slice(0, 80),
      short: short.slice(0, 200),
      description: (description || short).slice(0, 1000),
      image_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
      created_at: new Date().toISOString(),
    };

    const menu: MenuData = { ...before, custom: [...before.custom, product] };
    await saveMenu(menu, request, `custom-added:${id}`, before);
    return NextResponse.json({ success: true, product, menu });
  } catch (e) {
    console.error('Menu POST error:', e);
    return NextResponse.json({ error: 'Failed to add product.' }, { status: 500 });
  }
}

/** PATCH — edit a custom product's text or hidden flag. */
export async function PATCH(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });

    const before = await loadMenu();
    const idx = before.custom.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Custom product not found.' }, { status: 404 });

    const updated = { ...before.custom[idx] };
    if (body.name !== undefined) updated.name = String(body.name).trim().slice(0, 80) || updated.name;
    if (body.short !== undefined) updated.short = String(body.short).trim().slice(0, 200) || updated.short;
    if (body.description !== undefined) updated.description = String(body.description).trim().slice(0, 1000);
    if (body.hidden !== undefined) updated.hidden = Boolean(body.hidden);

    const custom = [...before.custom];
    custom[idx] = updated;
    const menu: MenuData = { ...before, custom };
    await saveMenu(menu, request, `custom-edited:${id}`, before);
    return NextResponse.json({ success: true, product: updated, menu });
  } catch (e) {
    console.error('Menu PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

/** DELETE — remove a custom product (and its Cloudinary image). */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });

    const before = await loadMenu();
    const item = before.custom.find((c) => c.id === id);
    if (!item) return NextResponse.json({ error: 'Custom product not found.' }, { status: 404 });

    if (item.cloudinary_public_id) {
      try {
        await getCloudinary().uploader.destroy(item.cloudinary_public_id);
      } catch {
        /* image already gone — continue */
      }
    }

    const menu: MenuData = { ...before, custom: before.custom.filter((c) => c.id !== id) };
    await saveMenu(menu, request, `custom-deleted:${id}`, before);
    return NextResponse.json({ success: true, menu });
  } catch (e) {
    console.error('Menu DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
