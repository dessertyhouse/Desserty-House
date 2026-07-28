import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import type { ReviewStatus } from '@/lib/reviews';

export const runtime = 'nodejs';

/**
 * Admin moderation for customer reviews:
 *  GET    — list every review (pending first) so the owner can moderate
 *  PATCH  — approve / reject / edit a review
 *  DELETE — permanently remove a review
 */

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
const STATUSES: ReviewStatus[] = ['pending', 'approved', 'hidden', 'rejected'];

export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Most likely the migration has not been run yet.
      return NextResponse.json({
        success: true,
        reviews: [],
        needsMigration: true,
        message:
          'The reviews table does not exist yet. Run sql/gallery-reviews-migration.sql in Supabase.',
      });
    }

    const reviews = data || [];
    const order: Record<string, number> = { pending: 0, approved: 1, hidden: 2, rejected: 3 };
    reviews.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

    return NextResponse.json({
      success: true,
      reviews,
      counts: {
        pending: reviews.filter((r) => r.status === 'pending').length,
        approved: reviews.filter((r) => r.status === 'approved').length,
        hidden: reviews.filter((r) => r.status === 'hidden').length,
        rejected: reviews.filter((r) => r.status === 'rejected').length,
      },
    });
  } catch (e) {
    console.error('Admin reviews GET error:', e);
    return NextResponse.json({ error: 'Failed to load reviews.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = txt(body.id, 60);
    if (!id) return NextResponse.json({ error: 'A review ID is required.' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) {
      const status = txt(body.status, 20) as ReviewStatus;
      if (!STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
      }
      patch.status = status;
    }
    if (body.customer_name !== undefined) patch.customer_name = txt(body.customer_name, 60);
    if (body.body !== undefined) patch.body = txt(body.body, 900);
    if (body.product_name !== undefined) patch.product_name = txt(body.product_name, 60);
    if (body.admin_note !== undefined) patch.admin_note = txt(body.admin_note, 400);
    if (body.rating !== undefined) {
      const r = Number(body.rating);
      if (Number.isFinite(r)) patch.rating = Math.min(5, Math.max(1, Math.round(r)));
    }

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const { data: before } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'admin',
      entity_id: `review:${id}`,
      old_value: before ?? undefined,
      new_value: data ?? undefined,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, review: data });
  } catch (e) {
    console.error('Admin reviews PATCH error:', e);
    return NextResponse.json({ error: 'Failed to update review.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const id = txt(body.id, 60);
    if (!id) return NextResponse.json({ error: 'A review ID is required.' }, { status: 400 });

    const { data: before } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
    if (error) throw error;

    await logAuditEvent({
      action: 'post_deleted',
      entity_type: 'admin',
      entity_id: `review:${id}`,
      old_value: before ?? undefined,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin reviews DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete review.' }, { status: 500 });
  }
}
