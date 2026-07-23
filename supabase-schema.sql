-- Complete Database Schema for Dessert(y) House
-- Run in Supabase SQL Editor

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), 
  order_id text unique not null, 
  product_id text not null,
  style_code text, 
  customer_name text not null, 
  phone text not null, 
  event_date date not null, 
  egg_preference text,
  quantity text not null, 
  area text, 
  notes text, 
  source text default 'Website',
  status text not null default 'Request received', 
  payment_status text not null default 'Not requested',
  scheduled_at timestamptz, 
  admin_notes text, 
  customer_message text, 
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders enable row level security;

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_orders_updated_at
  before update on public.orders
  for each row
  execute procedure update_updated_at_column();

-- ============================================
-- PRODUCT STYLES TABLE (for future CMS)
-- ============================================
create table if not exists public.product_styles (
  id uuid primary key default gen_random_uuid(), 
  product_id text not null, 
  style_code text unique not null, 
  title text not null, 
  description text, 
  image_url text not null, 
  instagram_url text, 
  is_active boolean default true, 
  sort_order int default 0, 
  created_at timestamptz default now()
);

alter table public.product_styles enable row level security;

-- ============================================
-- OFFERS & ANNOUNCEMENTS TABLE
-- ============================================
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(), 
  title text not null, 
  description text, 
  image_url text, 
  offer_code text unique, 
  cta_label text default 'Order on WhatsApp', 
  starts_at timestamptz, 
  ends_at timestamptz, 
  is_published boolean default false, 
  created_at timestamptz default now()
);

alter table public.offers enable row level security;

-- ============================================
-- POSTS TABLE (Admin content management)
-- ============================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  kind text not null default 'offer',
  cloudinary_public_id text not null,
  image_url text not null,
  is_published boolean default true,
  post_code text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

-- Trigger to update updated_at for posts
create trigger update_posts_updated_at
  before update on public.posts
  for each row
  execute procedure update_updated_at_column();

-- ============================================
-- WORKERS TABLE (for future staff management)
-- ============================================
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(), 
  full_name text not null, 
  role text not null,
  phone text, 
  status text not null default 'Active', 
  notes text, 
  created_at timestamptz default now()
);

alter table public.workers enable row level security;

-- ============================================
-- AUDIT LOGS TABLE (Security & Compliance)
-- ============================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null check (entity_type in ('order', 'post', 'admin', 'worker')),
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create index for efficient audit log queries
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_created on public.audit_logs(created_at desc);

-- Audit logs should be readable by admin only
alter table public.audit_logs enable row level security;

-- ============================================
-- RATE LIMIT TRACKING TABLE (Optional - for distributed setups)
-- ============================================
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  endpoint text not null,
  request_count int default 1,
  window_start timestamptz default now(),
  unique(identifier, endpoint)
);

-- Index for cleanup queries
create index idx_rate_limits_window on public.rate_limits(window_start);

-- ============================================
-- MIGRATION HELPERS - Add columns if not exist
-- ============================================

-- Orders table additions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'style_code') THEN
    ALTER TABLE public.orders ADD COLUMN style_code text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
    ALTER TABLE public.orders ADD COLUMN updated_at timestamptz default now();
  END IF;
END $$;

-- Posts table additions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'post_code') THEN
    ALTER TABLE public.posts ADD COLUMN post_code text unique;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
    ALTER TABLE public.posts ADD COLUMN updated_at timestamptz default now();
  END IF;
END $$;

-- Comments for documentation
comment on table public.orders is 'Customer order requests - primary business data';
comment on table public.posts is 'Admin-managed promotional content and announcements';
comment on table public.audit_logs is 'Security audit trail for all admin actions';
