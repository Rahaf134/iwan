create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text not null,
  description text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  compare_at numeric(10,2),
  rating numeric(2,1) not null default 5.0,
  reviews integer not null default 0,
  colors jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  badge text,
  featured boolean not null default false,
  description text not null default '',
  dimensions text not null default '',
  care text not null default '',
  store_id uuid references public.stores(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);

alter table public.stores enable row level security;
alter table public.products enable row level security;

create policy "stores_read" on public.stores for select to anon, authenticated using (true);
create policy "stores_insert" on public.stores for insert to anon, authenticated with check (true);
create policy "stores_update" on public.stores for update to anon, authenticated using (true) with check (true);
create policy "stores_delete" on public.stores for delete to anon, authenticated using (true);

create policy "products_read" on public.products for select to anon, authenticated using (true);
create policy "products_insert" on public.products for insert to anon, authenticated with check (true);
create policy "products_update" on public.products for update to anon, authenticated using (true) with check (true);
create policy "products_delete" on public.products for delete to anon, authenticated using (true);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger products_touch_updated_at before update on public.products
for each row execute function public.touch_updated_at();

insert into public.stores (name, city, address, description, image_url) values
('Ewan Antwerp Flagship', 'Antwerp', 'Kloosterstraat 42, 2000 Antwerp, Belgium', 'Our original showroom in the heart of the antiques quarter, set across two light-filled floors of a restored 19th-century townhouse.', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_03880be5-11f1-4480-a3ab-d645b111aea7.jpg'),
('Ewan Brussels Atelier', 'Brussels', 'Rue du Canal 18, 1000 Brussels, Belgium', 'A working atelier and appointment-only gallery where every bespoke commission is drawn, sampled and finished by hand.', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_037e26cc-d3f9-459c-a41f-7a2a9cd3f51d.jpg'),
('Ewan Ghent Studio', 'Ghent', 'Burgstraat 7, 9000 Ghent, Belgium', 'A quiet studio devoted to lighting and small objects, with a material library open to designers and clients.', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_21994dac-df90-4d7d-90eb-8f0b5797078b.jpg');