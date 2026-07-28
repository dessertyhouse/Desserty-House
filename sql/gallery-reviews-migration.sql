-- ===========================================================================
-- Desserty House — Gallery + verified customer Reviews migration
-- Safe to run more than once. Run this in the Supabase SQL editor.
--
-- Adds:
--   1. public.reviews  — customer-written reviews, verified against a real
--                        order and moderated by the admin before going live.
--   2. gallery data     — stored as a JSON blob in site_settings (key 'gallery'),
--                        so no extra table is needed; this block only documents it.
-- ===========================================================================

-- --------------------------------------------------------------------------
-- 1. Verified customer reviews
-- --------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  -- link to the order that proves the reviewer actually bought from us
  order_id text not null,               -- e.g. DH-2026-0001
  phone text not null,                  -- WhatsApp number used on that order
  product_id text,                      -- e.g. BRW-001 (copied from the order)
  product_name text,                    -- human label shown on the site

  -- the review itself
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,

  -- moderation:
  --   'pending'  → waiting for the owner to look at it (default)
  --   'approved' → live on the website
  --   'hidden'   → was live, taken down by the owner (unwanted / misbehaviour)
  --   'rejected' → refused at approval time
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden', 'rejected')),
  admin_note text,                      -- private, never shown publicly

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- one review per order
  constraint reviews_unique_order unique (order_id)
);

create index if not exists reviews_status_idx on public.reviews (status, created_at desc);
create index if not exists reviews_order_idx on public.reviews (order_id);

alter table public.reviews enable row level security;
-- No anonymous policies: only the server (service role) reads/writes.
-- The public page reads approved reviews through the server, never directly.

-- keep updated_at fresh
create or replace function public.touch_reviews_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_reviews_updated_at();

-- --------------------------------------------------------------------------
-- 2. Gallery
-- --------------------------------------------------------------------------
-- The gallery lives in the existing site_settings table under key 'gallery':
--
--   {
--     "overrides": { "DH-SHOW-001": { "title": "...", "category": "...",
--                                     "description": "...", "hidden": true } },
--     "custom":    [ { "code": "DH-SHOW-C1A2B3", "title": "...",
--                      "category": "...", "description": "...",
--                      "image_url": "https://res.cloudinary.com/...",
--                      "cloudinary_public_id": "...", "hidden": false } ]
--   }
--
-- Requires sql/site-settings-migration.sql to have been run (creates the table).
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

-- ---------------------------------------------------------------------------
-- Upgrade for installs created before the 'hidden' status existed.
-- Safe to run on a fresh database too (it simply re-applies the constraint).
-- ---------------------------------------------------------------------------
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews add constraint reviews_status_check
  check (status in ('pending', 'approved', 'hidden', 'rejected'));
