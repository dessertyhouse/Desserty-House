-- Site settings table (safe to run even if cms-admin-migration.sql already created it).
-- Stores admin-editable website details: phone, email, Instagram, announcement banner,
-- delivery areas, business hours text, hidden products and home hero text.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
-- No anonymous policies: only the server (service role) reads/writes this table.

-- ---------------------------------------------------------------------------
-- Keys used by the admin dashboard (all optional — the site falls back to the
-- code defaults whenever a key is missing):
--
--   'site'    → contact details, announcement banner, delivery areas, hours,
--               hidden products, home hero heading/sub-heading
--               (src/lib/settings.ts)
--   'menu'    → category overrides, per-item (style) overrides, extra items
--               and admin-added categories
--               (src/lib/menu.ts)
--   'content' → hero trust badges, how-it-works steps, FAQs, testimonials,
--               About copy, lead times, SEO description and AI-assistant text
--               (src/lib/content.ts)
-- ---------------------------------------------------------------------------
