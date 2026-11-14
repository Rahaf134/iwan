alter table public.stores add column if not exists legacy_id text;
alter table public.stores add column if not exists area text not null default '';
alter table public.stores add column if not exists specialty text not null default '';
alter table public.stores add column if not exists phone text not null default '';
alter table public.stores add column if not exists verified boolean not null default true;
alter table public.products add column if not exists available boolean not null default true;

create table if not exists public.designers (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  name text not null,
  title text not null default '',
  area text not null default '',
  years integer not null default 0,
  rating numeric(2,1) not null default 5.0,
  bio text not null default '',
  image_url text not null default '',
  portfolio jsonb not null default '[]'::jsonb,
  kind text not null default 'designer',
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  name text not null,
  type text not null default '',
  description text not null default '',
  icon text not null default 'store',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  name text not null,
  area text not null default '',
  rating integer not null default 5,
  text text not null default '',
  service text not null default '',
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  question text not null,
  answer text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'order',
  name text not null,
  phone text not null default '',
  details text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.designers enable row level security;
alter table public.partners enable row level security;
alter table public.reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.requests enable row level security;

drop policy if exists "designers_all" on public.designers;
create policy "designers_all" on public.designers for all using (true) with check (true);
drop policy if exists "partners_all" on public.partners;
create policy "partners_all" on public.partners for all using (true) with check (true);
drop policy if exists "reviews_all" on public.reviews;
create policy "reviews_all" on public.reviews for all using (true) with check (true);
drop policy if exists "faqs_all" on public.faqs;
create policy "faqs_all" on public.faqs for all using (true) with check (true);
drop policy if exists "requests_all" on public.requests;
create policy "requests_all" on public.requests for all using (true) with check (true);