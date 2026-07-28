import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import {
  normaliseGallery,
  type GalleryData,
  type GalleryOverride,
  type CustomGalleryItem,
} from '@/lib/gallery';
import { showcase as staticShowcase } from '@/app/(public)/showcase/data';
import { sanitiseLink, type ItemLink } from '@/lib/links';

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

const txt = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

/** Parse + sanitise an admin-supplied links payload (max 5 per item). */
function parseLinks(raw: unknown): ItemLink[] {
  let arr: unknown = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((l) => sanitiseLink((l as ItemLink)?.url, (l as ItemLink)?.label))
    .filter(Boolean)
    .slice(0, 5) as ItemLink[];
}

async function loadGallery(): Promise<GalleryData> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'gallery')
      .single();
    if (data?.value) return normaliseGallery(data.value);
  } catch {
    /* fall through */
  }
  return { overrides: {}, custom: [] };
}

async function saveGallery(
  gallery: GalleryData,
  request: NextRequest,
  action: string,
  before: unknown
) {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(
      { key: 'gallery', value: gallery, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) throw error;
  await logAuditEvent({
    action: 'post_updated',
    entity_type: 'admin',
    entity_id: `gallery:${action}`,
    old_value: before as Record<string, unknown>,
    new_value: gallery as unknown as Record<string, unknown>,
    ...createAuditContext(request),
  });
}

async function destroyImage(publicId?: string) {
  if (!publicId) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch {
    /* already gone */
  }
}

/** GET — gallery admin data: the built-in 46 plus admin-added items. */
export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const gallery = await loadGallery();
    return NextResponse.json({
      success: true,
      gallery,
      builtIn: staticShowcase.map((s) => ({
        code: s.code,
        title: s.title,
        category: s.category,
        description: s.description,
        image: s.image,
      })),
    });
  } catch (e) {
    console.error('Gallery GET error:', e);
    return NextResponse.json({ error: 'Failed to load gallery.' }, { status: 500 });
  }
}

/** PUT — save edits/hidden flags for the built-in gallery photos. */
export async function PUT(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    // Multipart PUT = replace the photo on a single item (built-in or custom).
    // JSON PUT keeps its original behaviour of saving text overrides in bulk.
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (txt(formData.get('action'), 40) === 'replace-image') {
        return await replaceImage(request, formData);
      }
      return NextResponse.json({ error: 'Unsupported form action.' }, { status: 400 });
    }

    const body = await request.json();
    const incoming = (body.overrides ?? {}) as Record<string, GalleryOverride>;
    const validCodes = new Set(staticShowcase.map((s) => s.code));

    const overrides: Record<string, GalleryOverride> = {};
    for (const [code, o] of Object.entries(incoming)) {
      if (!validCodes.has(code) || !o || typeof o !== 'object') continue;
      const clean: GalleryOverride = {};
      if (txt(o.title, 120)) clean.title = txt(o.title, 120);
      if (txt(o.category, 60)) clean.category = txt(o.category, 60);
      if (txt(o.description, 600)) clean.description = txt(o.description, 600);
      if (o.hidden) clean.hidden = true;
      const links = parseLinks(o.links);
      if (links.length) clean.links = links;
      if (Object.keys(clean).length) overrides[code] = clean;
    }

    const before = await loadGallery();

    // A bulk text save must never drop a replacement photo the admin uploaded
    // earlier, so carry the image fields across from the stored overrides.
    for (const [code, prev] of Object.entries(before.overrides)) {
      if (!prev?.image_url) continue;
      overrides[code] = {
        ...(overrides[code] || {}),
        image_url: prev.image_url,
        cloudinary_public_id: prev.cloudinary_public_id,
      };
    }

    const gallery: GalleryData = { ...before, overrides };
    await saveGallery(gallery, request, 'overrides-saved', before);
    return NextResponse.json({ success: true, gallery });
  } catch (e) {
    console.error('Gallery PUT error:', e);
    return NextResponse.json(
      {
        error:
          'Failed to save. Make sure the site_settings table exists (run sql/site-settings-migration.sql).',
      },
      { status: 500 }
    );
  }
}

/** POST — add a new gallery photo (multipart with image). */
export async function POST(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const title = txt(formData.get('title'), 120);
    const category = txt(formData.get('category'), 60) || 'Other';
    const description = txt(formData.get('description'), 600);
    const file = formData.get('image') as File | null;

    if (!title) return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
    if (!file || !file.size) {
      return NextResponse.json({ error: 'A photo is required.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Image must be WebP, JPG or PNG.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image must be under 8 MB.' }, { status: 400 });
    }

    const before = await loadGallery();
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        getCloudinary()
          .uploader.upload_stream(
            {
              folder: 'Desserty House/previous-orders',
              resource_type: 'image',
              context: { alt: title },
            },
            (error, res) =>
              error || !res ? reject(error || new Error('Upload failed')) : resolve(res as never)
          )
          .end(buffer);
      }
    );

    const item: CustomGalleryItem = {
      code: `DH-SHOW-C${Date.now().toString(36).toUpperCase().slice(-5)}`,
      title,
      category,
      description:
        description ||
        `A real ${'Dessert(y) House'} ${category.toLowerCase()} made for a customer celebration. Enquire with this code to discuss a similar style.`,
      image_url: uploaded.secure_url,
      cloudinary_public_id: uploaded.public_id,
      links: parseLinks(formData.get('links')),
      created_at: new Date().toISOString(),
    };

    const gallery: GalleryData = { ...before, custom: [...before.custom, item] };
    await saveGallery(gallery, request, `added:${item.code}`, before);
    return NextResponse.json({ success: true, item, gallery });
  } catch (e) {
    console.error('Gallery POST error:', e);
    return NextResponse.json({ error: 'Failed to add gallery photo.' }, { status: 500 });
  }
}

/**
 * PUT with multipart body (action=replace-image) — swap the PHOTO on any
 * gallery item, built-in or admin-added, without deleting the item.
 *
 * Built-in items: the new image is stored as an override, so the original
 * Cloudinary asset is untouched and "Reset" restores it.
 * Admin-added items: the old upload is destroyed to avoid orphaned assets.
 */
async function replaceImage(request: NextRequest, formData: FormData) {
  const code = txt(formData.get('code'), 40);
  const file = formData.get('image') as File | null;

  if (!code) return NextResponse.json({ error: 'A code is required.' }, { status: 400 });
  if (!file || !file.size) {
    return NextResponse.json({ error: 'A replacement photo is required.' }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Image must be WebP, JPG or PNG.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be under 8 MB.' }, { status: 400 });
  }

  const before = await loadGallery();
  const custom = [...before.custom];
  const idx = custom.findIndex((c) => c.code === code);
  const isBuiltIn = idx === -1;

  if (isBuiltIn && !staticShowcase.some((s) => s.code === code)) {
    return NextResponse.json({ error: 'Gallery photo not found.' }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      getCloudinary()
        .uploader.upload_stream(
          { folder: 'Desserty House/previous-orders', resource_type: 'image' },
          (error, res) =>
            error || !res ? reject(error || new Error('Upload failed')) : resolve(res as never)
        )
        .end(buffer);
    }
  );

  let gallery: GalleryData;
  if (isBuiltIn) {
    const prev = before.overrides[code];
    // Remove a PREVIOUS replacement, but never the original built-in asset.
    await destroyImage(prev?.cloudinary_public_id);
    gallery = {
      ...before,
      overrides: {
        ...before.overrides,
        [code]: {
          ...prev,
          image_url: uploaded.secure_url,
          cloudinary_public_id: uploaded.public_id,
        },
      },
    };
  } else {
    await destroyImage(custom[idx].cloudinary_public_id);
    custom[idx] = {
      ...custom[idx],
      image_url: uploaded.secure_url,
      cloudinary_public_id: uploaded.public_id,
    };
    gallery = { ...before, custom };
  }

  await saveGallery(gallery, request, `replaced-image:${code}`, before);
  return NextResponse.json({ success: true, gallery, image_url: uploaded.secure_url });
}

/** PATCH — edit or hide an admin-added gallery photo. */
export async function PATCH(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const code = txt(body.code, 40);
    if (!code) return NextResponse.json({ error: 'A code is required.' }, { status: 400 });

    const before = await loadGallery();
    const idx = before.custom.findIndex((c) => c.code === code);
    if (idx === -1) return NextResponse.json({ error: 'Gallery photo not found.' }, { status: 404 });

    const updated = { ...before.custom[idx] };
    if (body.title !== undefined) updated.title = txt(body.title, 120) || updated.title;
    if (body.category !== undefined) updated.category = txt(body.category, 60) || updated.category;
    if (body.description !== undefined) updated.description = txt(body.description, 600);
    if (body.hidden !== undefined) updated.hidden = Boolean(body.hidden);
    if (body.links !== undefined) updated.links = parseLinks(body.links);

    const custom = [...before.custom];
    custom[idx] = updated;
    const gallery: GalleryData = { ...before, custom };
    await saveGallery(gallery, request, `edited:${code}`, before);
    return NextResponse.json({ success: true, gallery });
  } catch (e) {
    console.error('Gallery PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update gallery photo.' }, { status: 500 });
  }
}

/** DELETE — remove an admin-added photo, or reset a built-in one's edits. */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const code = txt(body.code, 40);
    if (!code) return NextResponse.json({ error: 'A code is required.' }, { status: 400 });

    const before = await loadGallery();
    const item = before.custom.find((c) => c.code === code);

    if (item) {
      await destroyImage(item.cloudinary_public_id);
      const gallery: GalleryData = {
        ...before,
        custom: before.custom.filter((c) => c.code !== code),
      };
      await saveGallery(gallery, request, `deleted:${code}`, before);
      return NextResponse.json({ success: true, gallery });
    }

    // Built-in photo: clear its edits so the original text AND photo come back.
    const overrides = { ...before.overrides };
    // Remove any admin-uploaded replacement so it doesn't orphan in Cloudinary.
    await destroyImage(overrides[code]?.cloudinary_public_id);
    delete overrides[code];
    const gallery: GalleryData = { ...before, overrides };
    await saveGallery(gallery, request, `reset:${code}`, before);
    return NextResponse.json({ success: true, gallery });
  } catch (e) {
    console.error('Gallery DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
  }
}
