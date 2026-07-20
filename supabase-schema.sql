-- Run in Supabase SQL Editor. This table is accessed only via server API using SERVICE_ROLE key.
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(), order_id text unique not null, product_id text not null,
 style_code text, customer_name text not null, phone text not null, event_date date not null, egg_preference text,
 quantity text not null, area text, notes text, source text default 'Website',
 status text not null default 'Request received', payment_status text not null default 'Not requested',
 scheduled_at timestamptz, admin_notes text, customer_message text, created_at timestamptz default now()
);
alter table public.orders enable row level security;
-- No anonymous policies: browser has no direct table access. The server uses SUPABASE_SERVICE_ROLE_KEY.

-- If you ran an earlier version, also run this once:
alter table public.orders add column if not exists style_code text;

-- Content-management design for the next CMS step:
create table if not exists public.product_styles (id uuid primary key default gen_random_uuid(), product_id text not null, style_code text unique not null, title text not null, description text, image_url text not null, instagram_url text, is_active boolean default true, sort_order int default 0, created_at timestamptz default now());
create table if not exists public.offers (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, offer_code text unique, cta_label text default 'Order on WhatsApp', starts_at timestamptz, ends_at timestamptz, is_published boolean default false, created_at timestamptz default now());
