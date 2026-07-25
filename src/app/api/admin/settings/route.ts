import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { defaultSettings, type SiteSettings } from '@/lib/settings';

export const runtime = 'nodejs';

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

/** GET /api/admin/settings — current settings (defaults merged with saved overrides). */
export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', 'site')
      .single();
    const settings: SiteSettings = {
      ...defaultSettings,
      ...((data?.value as Partial<SiteSettings>) || {}),
    };
    return NextResponse.json({ success: true, settings, updated_at: data?.updated_at ?? null });
  } catch {
    return NextResponse.json({ success: true, settings: defaultSettings, updated_at: null });
  }
}

/** PUT /api/admin/settings — save settings (validated, audited). */
export async function PUT(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = (await request.json()) as Partial<SiteSettings>;

    // Basic validation
    const phoneDigits = String(body.phoneDigits ?? defaultSettings.phoneDigits).replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json({ error: 'Phone number must be 10–15 digits (with country code).' }, { status: 400 });
    }
    const email = String(body.email ?? defaultSettings.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const clean: SiteSettings = {
      phoneDigits,
      phoneDisplay: String(body.phoneDisplay ?? defaultSettings.phoneDisplay).trim().slice(0, 30),
      email,
      instagram: String(body.instagram ?? defaultSettings.instagram).trim().slice(0, 200),
      announcement: String(body.announcement ?? '').trim().slice(0, 200),
      deliveryAreas: (Array.isArray(body.deliveryAreas) ? body.deliveryAreas : defaultSettings.deliveryAreas)
        .map((a) => String(a).trim())
        .filter(Boolean)
        .slice(0, 30),
      hoursText: String(body.hoursText ?? defaultSettings.hoursText).trim().slice(0, 120),
      hiddenProducts: (Array.isArray(body.hiddenProducts) ? body.hiddenProducts : [])
        .map((a) => String(a).trim())
        .filter(Boolean),
      heroTitle: String(body.heroTitle ?? '').trim().slice(0, 120),
      heroSubtitle: String(body.heroSubtitle ?? '').trim().slice(0, 300),
    };

    const { data: before } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'site')
      .single();

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'site', value: clean, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;

    await logAuditEvent({
      action: 'post_updated' as any,
      entity_type: 'admin' as const, // closest allowed audit entity for settings changes
      entity_id: 'site',
      old_value: before?.value ?? null,
      new_value: clean,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, settings: clean });
  } catch (e) {
    console.error('Settings save error:', e);
    return NextResponse.json(
      { error: 'Failed to save settings. Make sure the site_settings table exists (run sql/cms-admin-migration.sql).' },
      { status: 500 }
    );
  }
}
