-- Dessert(y) House Admin Workspace V2
-- Run in Supabase SQL Editor after backup. This prepares operations, CRM, financials and audit history.

alter table public.orders add column if not exists subtotal numeric default 0;
alter table public.orders add column if not exists delivery_fee numeric default 0;
alter table public.orders add column if not exists discount numeric default 0;
alter table public.orders add column if not exists total_amount numeric default 0;
alter table public.orders add column if not exists amount_received numeric default 0;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists priority text not null default 'Normal' check (priority in ('Low','Normal','High','Urgent'));
alter table public.orders add column if not exists customer_id uuid;
alter table public.orders add column if not exists completed_at timestamptz;

create table if not exists public.customers (
 id uuid primary key default gen_random_uuid(),
 full_name text not null,
 phone text unique not null,
 area text,
 birthday date,
 preferred_products text[] default '{}',
 owner_notes text,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
alter table public.customers enable row level security;

alter table public.orders add constraint orders_customer_id_fkey foreign key (customer_id) references public.customers(id) on delete set null;

create table if not exists public.order_history (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 event_type text not null,
 from_value text,
 to_value text,
 note text,
 operator_name text not null default 'Owner',
 created_at timestamptz not null default now()
);
alter table public.order_history enable row level security;

create table if not exists public.order_tasks (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 stage text not null check (stage in ('Ingredients ready','Baking','Decorating','Quality check','Packing','Ready for handover')),
 is_complete boolean not null default false,
 completed_at timestamptz,
 notes text,
 created_at timestamptz default now()
);
alter table public.order_tasks enable row level security;

create index if not exists orders_event_date_idx on public.orders(event_date);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists order_history_order_idx on public.order_history(order_id,created_at desc);
