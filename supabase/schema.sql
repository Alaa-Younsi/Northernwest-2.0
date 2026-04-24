-- Northernwest 2.0 — Supabase Schema
-- Run in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_fr text not null,
  name_ar text not null,
  description_en text,
  description_fr text,
  description_ar text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  slug text unique not null,
  name_en text not null,
  name_fr text not null,
  name_ar text not null,
  description_en text,
  description_fr text,
  description_ar text,
  base_price numeric(10,2) not null,
  images text[] default '{}',
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Product variants
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  name_en text not null,
  name_fr text not null,
  name_ar text not null,
  sku text unique not null,
  price_modifier numeric(10,2) default 0,
  stock int default 0,
  color_hex text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  country text not null,
  city text not null,
  address_line1 text not null,
  address_line2 text,
  zip_code text,
  total_amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name_en text not null,
  variant_name_en text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_variants_product on product_variants(product_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- Row Level Security
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read policies
create policy "categories_public_read" on categories for select using (true);
create policy "products_public_read" on products for select using (is_active = true);
create policy "variants_public_read" on product_variants for select using (true);

-- Anon can insert orders (checkout)
create policy "orders_insert" on orders for insert with check (true);
create policy "order_items_insert" on order_items for insert with check (true);

-- Service role bypasses RLS (server uses service role key)

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_service_upload" on storage.objects
  for insert with check (bucket_id = 'product-images');
