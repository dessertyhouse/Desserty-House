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
