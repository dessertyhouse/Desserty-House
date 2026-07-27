import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Customer feedback wall — chat screenshots the owner receives on WhatsApp or
 * Instagram and chooses to publish.
 *
 * These are stored in the existing `posts` table with kind='feedback' (so any
 * feedback already published stays exactly where it is), but they now have
 * their own dedicated endpoint and admin tab instead of being mixed in with
 * blog posts and offers.
 */

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

/** GET — every feedback screenshot, newest first. */
export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('kind', 'feedback')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, feedback: data || [] });
  } catch (e) {
    console.error('Feedback GET error:', e);
    return NextResponse.json({ error: 'Failed to load feedback.' }, { status: 500 });
  }
}

/** POST — upload a new chat screenshot (multipart). */
export async function POST(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const formData = await request.formData();
    const title = txt(formData.get('title'), 120);
    const description = txt(formData.get('description'), 600);
    const publishNow = String(formData.get('publish') ?? 'true') !== 'false';
    const file = formData.get('image') as File | null;

    if (!title) {
      return NextResponse.json(
        { error: 'A short label is required (e.g. the customer’s first name and product).' },
        { status: 400 }
      );
    }
    if (!file || !file.size) {
      return NextResponse.json({ error: 'A screenshot is required.' }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Image must be WebP, JPG or PNG.' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image must be under 8 MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        getCloudinary()
          .uploader.upload_stream(
            {
              folder: 'Desserty House/feedback',
              resource_type: 'image',
              context: { alt: title },
            },
            (error, res) =>
              error || !res ? reject(error || new Error('Upload failed')) : resolve(res as never)
          )
          .end(buffer);
      }
    );

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        description,
        kind: 'feedback',
        image_url: uploaded.secure_url,
        cloudinary_public_id: uploaded.public_id,
        is_published: publishNow,
        post_code: `DH-FB-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      })
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      action: 'post_created',
      entity_type: 'post',
      entity_id: data?.id,
      new_value: data ?? undefined,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, item: data });
  } catch (e) {
    console.error('Feedback POST error:', e);
    return NextResponse.json({ error: 'Failed to upload feedback.' }, { status: 500 });
  }
}

/** PATCH — edit the label/caption or show/hide a screenshot. */
export async function PATCH(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = txt(body.id, 60);
    if (!id) return NextResponse.json({ error: 'An ID is required.' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = txt(body.title, 120);
    if (body.description !== undefined) patch.description = txt(body.description, 600);
    if (body.is_published !== undefined) patch.is_published = Boolean(body.is_published);

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(patch)
      .eq('id', id)
      .eq('kind', 'feedback')
      .select()
      .single();
    if (error) throw error;

    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'post',
      entity_id: id,
      new_value: data ?? undefined,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, item: data });
  } catch (e) {
    console.error('Feedback PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update feedback.' }, { status: 500 });
  }
}

/** DELETE — remove a screenshot and its Cloudinary image. */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = txt(body.id, 60);
    if (!id) return NextResponse.json({ error: 'An ID is required.' }, { status: 400 });

    const { data: before } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('kind', 'feedback')
      .single();

    if (before?.cloudinary_public_id) {
      try {
        await getCloudinary().uploader.destroy(before.cloudinary_public_id);
      } catch {
        /* image already gone */
      }
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('kind', 'feedback');
    if (error) throw error;

    await logAuditEvent({
      action: 'post_deleted',
      entity_type: 'post',
      entity_id: id,
      old_value: before ?? undefined,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Feedback DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete feedback.' }, { status: 500 });
  }
}
