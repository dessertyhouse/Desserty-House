import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { defaultSettings, type SiteSettings } from '@/lib/settings';

export const runtime = 'nodejs';

/**
 * Brand logo upload / removal.
 *
 * POST   — upload a square (1:1) logo. It is cropped to a centred square and
 *          normalised to 512x512 by Cloudinary, so a slightly-off crop still
 *          comes out perfectly square on the site.
 * DELETE — remove the custom logo and fall back to the built-in default mark.
 */

const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'];
const MAX_FILE_SIZE = 4 * 1024 * 1024;

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

async function loadSettings(): Promise<SiteSettings> {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'site')
      .single();
    return { ...defaultSettings, ...((data?.value as Partial<SiteSettings>) || {}) };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings: SiteSettings) {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(
      { key: 'site', value: settings, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) throw error;
}

/** POST — upload a new logo. */
export async function POST(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: 'Please choose a logo image.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Logo must be a PNG, WebP, JPG or SVG file.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Logo must be under 4 MB.' }, { status: 400 });
    }

    const before = await loadSettings();
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        getCloudinary()
          .uploader.upload_stream(
            {
              folder: 'Desserty House/brand',
              public_id: 'site-logo',
              overwrite: true,
              invalidate: true,
              resource_type: 'image',
              // Force a centred 1:1 square at 512x512 regardless of what was uploaded
              transformation: [
                { width: 512, height: 512, crop: 'fill', gravity: 'auto' },
                { quality: 'auto', fetch_format: 'auto' },
              ],
              context: { alt: 'Desserty House logo' },
            },
            (error, res) =>
              error || !res ? reject(error || new Error('Upload failed')) : resolve(res as never)
          )
          .end(buffer);
      }
    );

    const settings: SiteSettings = {
      ...before,
      logoUrl: uploaded.secure_url,
      logoPublicId: uploaded.public_id,
    };
    await saveSettings(settings);

    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'admin',
      entity_id: 'site:logo-uploaded',
      old_value: { logoUrl: before.logoUrl },
      new_value: { logoUrl: settings.logoUrl },
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, settings });
  } catch (e) {
    console.error('Logo upload error:', e);
    return NextResponse.json(
      {
        error:
          'Failed to upload the logo. Check your Cloudinary keys and that the site_settings table exists.',
      },
      { status: 500 }
    );
  }
}

/** DELETE — remove the custom logo and go back to the default mark. */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const before = await loadSettings();

    if (before.logoPublicId) {
      try {
        await getCloudinary().uploader.destroy(before.logoPublicId, { invalidate: true });
      } catch {
        /* image already gone — carry on */
      }
    }

    const settings: SiteSettings = { ...before, logoUrl: '', logoPublicId: '' };
    await saveSettings(settings);

    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'admin',
      entity_id: 'site:logo-removed',
      old_value: { logoUrl: before.logoUrl },
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, settings });
  } catch (e) {
    console.error('Logo delete error:', e);
    return NextResponse.json({ error: 'Failed to remove the logo.' }, { status: 500 });
  }
}
