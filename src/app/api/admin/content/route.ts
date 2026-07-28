import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/auth';
import { logAuditEvent, createAuditContext } from '@/lib/audit-log';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import {
  defaultContent,
  mergeContent,
  type SiteContent,
  type TrustBadge,
  type HowStep,
  type FaqItem,
  type TestimonialItem,
  type AboutBlock,
} from '@/lib/content';

export const runtime = 'nodejs';

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

const text = (v: unknown, max: number, fallback = '') => {
  const s = typeof v === 'string' ? v.trim() : '';
  return (s || fallback).slice(0, max);
};

/** GET — current editable content (defaults merged with saved overrides). */
export async function GET(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value, updated_at')
      .eq('key', 'content')
      .single();
    return NextResponse.json({
      success: true,
      content: mergeContent(data?.value as Partial<SiteContent> | undefined),
      defaults: defaultContent,
      updated_at: data?.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({
      success: true,
      content: defaultContent,
      defaults: defaultContent,
      updated_at: null,
    });
  }
}

/** PUT — save edited content (validated, sanitised, audited). */
export async function PUT(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    const body = (await request.json()) as Partial<SiteContent>;

    const trustBadges: TrustBadge[] = (Array.isArray(body.trustBadges) ? body.trustBadges : [])
      .map((b) => ({ icon: text(b?.icon, 30, 'sparkle'), label: text(b?.label, 60) }))
      .filter((b) => b.label)
      .slice(0, 6);

    const howSteps: HowStep[] = (Array.isArray(body.howSteps) ? body.howSteps : [])
      .map((s) => ({
        icon: text(s?.icon, 30, 'sparkle'),
        title: text(s?.title, 60),
        body: text(s?.body, 300),
      }))
      .filter((s) => s.title)
      .slice(0, 6);

    const faqs: FaqItem[] = (Array.isArray(body.faqs) ? body.faqs : [])
      .map((f) => ({ q: text(f?.q, 200), a: text(f?.a, 1200) }))
      .filter((f) => f.q && f.a)
      .slice(0, 40);

    const testimonials: TestimonialItem[] = (Array.isArray(body.testimonials) ? body.testimonials : [])
      .map((t) => {
        const rawRating = Number(t?.rating);
        const rating = Number.isFinite(rawRating) ? Math.min(5, Math.max(1, Math.round(rawRating))) : 5;
        const rawDate = text(t?.date, 10);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
          ? rawDate
          : new Date().toISOString().slice(0, 10);
        return {
          name: text(t?.name, 60),
          rating,
          date,
          product: text(t?.product, 60, 'Order'),
          text: text(t?.text, 900),
          ...(t?.hidden ? { hidden: true } : {}),
        };
      })
      .filter((t) => t.name && t.text)
      .slice(0, 60);

    const aboutBlocks: AboutBlock[] = (Array.isArray(body.aboutBlocks) ? body.aboutBlocks : [])
      .map((b) => ({ heading: text(b?.heading, 80), body: text(b?.body, 1500) }))
      .filter((b) => b.heading && b.body)
      .slice(0, 10);

    const stringList = (v: unknown, max: number, len: number) =>
      (Array.isArray(v) ? v : [])
        .map((x) => text(x, len))
        .filter(Boolean)
        .slice(0, max);

    const clean: SiteContent = {
      trustBadges: trustBadges.length ? trustBadges : defaultContent.trustBadges,
      menuHeading: text(body.menuHeading, 120, defaultContent.menuHeading),
      menuIntro: text(body.menuIntro, 400, defaultContent.menuIntro),
      howHeading: text(body.howHeading, 120, defaultContent.howHeading),
      howSteps: howSteps.length ? howSteps : defaultContent.howSteps,
      faqs: faqs.length ? faqs : defaultContent.faqs,
      testimonials, // may legitimately be empty (owner removed all reviews)
      aboutLead: text(body.aboutLead, 600, defaultContent.aboutLead),
      aboutBlocks: aboutBlocks.length ? aboutBlocks : defaultContent.aboutBlocks,
      whyChooseUs: (() => {
        const l = stringList(body.whyChooseUs, 12, 160);
        return l.length ? l : defaultContent.whyChooseUs;
      })(),
      leadTimes: (() => {
        const l = stringList(body.leadTimes, 12, 160);
        return l.length ? l : defaultContent.leadTimes;
      })(),
      seoDescription: text(body.seoDescription, 400, defaultContent.seoDescription),
      aiSummary: text(body.aiSummary, 1200, defaultContent.aiSummary),
      aiGuidance: text(body.aiGuidance, 1500, defaultContent.aiGuidance),
    };

    const { data: before } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'content')
      .single();

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        { key: 'content', value: clean, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) throw error;

    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'admin',
      entity_id: 'content',
      old_value: (before?.value as Record<string, unknown>) ?? undefined,
      new_value: clean as unknown as Record<string, unknown>,
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true, content: clean });
  } catch (e) {
    console.error('Content save error:', e);
    return NextResponse.json(
      {
        error:
          'Failed to save content. Make sure the site_settings table exists (run sql/site-settings-migration.sql).',
      },
      { status: 500 }
    );
  }
}

/** DELETE — reset all content back to the built-in code defaults. */
export async function DELETE(request: NextRequest) {
  const denied = await verifyAdmin(request);
  if (denied) return denied;
  try {
    await supabaseAdmin.from('site_settings').delete().eq('key', 'content');
    await logAuditEvent({
      action: 'post_updated',
      entity_type: 'admin',
      entity_id: 'content:reset',
      ...createAuditContext(request),
    });
    return NextResponse.json({ success: true, content: defaultContent });
  } catch (e) {
    console.error('Content reset error:', e);
    return NextResponse.json({ error: 'Failed to reset content.' }, { status: 500 });
  }
}
