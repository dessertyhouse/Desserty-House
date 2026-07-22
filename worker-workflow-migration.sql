-- Run in Supabase SQL Editor: Worker management, order assignment and reporting
create table if not exists public.workers (
 id uuid primary key default gen_random_uuid(),
 full_name text not null,
 role text not null,
 phone text,
 skills text[] default '{}',
 status text not null default 'Active' check (status in ('Active','Inactive')),
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.workers enable row level security;
alter table public.orders add column if not exists worker_id uuid references public.workers(id);
alter table public.orders add column if not exists worker_assigned_at timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;
alter table public.orders add column if not exists delivery_partner text;
alter table public.orders add column if not exists delivery_phone text;
alter table public.orders add column if not exists delivery_charge numeric;
create table if not exists public.worker_assignment_history (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
 previous_worker_id uuid references public.workers(id), new_worker_id uuid not null references public.workers(id),
 reason text not null, changed_at timestamptz not null default now()
);
alter table public.worker_assignment_history enable row level security;
