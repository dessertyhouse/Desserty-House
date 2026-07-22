-- Dessert(y) House CMS / team-admin migration
-- Run this in Supabase SQL Editor only after backing up existing tables.
-- This is the data foundation for draft → review → publish content management.

create type public.staff_role as enum ('owner','baker','content_manager');
create type public.publish_state as enum ('draft','published','archived');

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.staff_role not null default 'baker',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  state public.publish_state not null default 'published',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  product_code text unique not null,
  slug text unique not null,
  name text not null,
  short_description text not null,
  description text not null,
  egg_options text not null default 'Egg and eggless available',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  state public.publish_state not null default 'draft',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_styles (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  style_code text unique not null,
  title text not null,
  description text not null,
  cloudinary_public_id text,
  image_url text not null,
  instagram_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  state public.publish_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.showcase_items (
  id uuid primary key default gen_random_uuid(),
  showcase_code text unique not null,
  category text not null,
  title text not null,
  description text not null,
  cloudinary_public_id text,
  image_url text not null,
  instagram_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  state public.publish_state not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts add column if not exists state public.publish_state not null default 'draft';
alter table public.posts add column if not exists publish_at timestamptz;
alter table public.posts add column if not exists expires_at timestamptz;

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.catalog_products enable row level security;
alter table public.catalog_styles enable row level security;
alter table public.showcase_items enable row level security;
alter table public.content_revisions enable row level security;

-- Public customers can see only published/active items. Admin role policies are added
-- with Supabase Auth in the CMS implementation; do not add broad anonymous write policies.
create policy "public sees published products" on public.catalog_products for select using (state='published' and is_active=true);
create policy "public sees published styles" on public.catalog_styles for select using (state='published' and is_active=true);
create policy "public sees published showcase" on public.showcase_items for select using (state='published' and is_visible=true);
