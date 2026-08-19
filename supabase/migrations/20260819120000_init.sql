-- Iseul — schema inicial

create extension if not exists "pgcrypto";

-- Configurações da loja (singleton)
create table if not exists store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Iseul',
  tagline text not null default '이슬 K-BEAUTY',
  announcement text not null default 'Frete grátis acima de R$199. Estoque no Brasil, envio em até 24h. Produtos originais importados.',
  free_shipping_threshold numeric(10,2) not null default 199,
  pix_discount_percent numeric(5,2) not null default 5,
  trust_rating numeric(3,2) not null default 4.98,
  trust_rating_label text not null default 'Avaliação das clientes',
  updated_at timestamptz not null default now()
);

insert into store_settings (id) values (1) on conflict (id) do nothing;

-- Admin
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null default 'Admin',
  created_at timestamptz not null default now()
);

-- Produtos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shopee_id bigint unique,
  slug text not null unique,
  name text not null,
  full_name text not null default '',
  brand text not null default '',
  category_slug text not null,
  category_label text not null,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  pitch text not null default '',
  image_url text not null default '',
  image_fallback_url text,
  shopee_url text,
  sold_count int not null default 0,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  stock int not null default 10,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_slug_idx on products (category_slug);
create index if not exists products_active_idx on products (active);
create index if not exists products_sort_idx on products (sort_order, sold_count desc);

-- Clientes
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  cpf text,
  phone text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_lower_idx on customers (lower(email));

-- Pedidos
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'aguardando_pagamento',
  payment_status text not null default 'pendente',
  payment_method text not null default 'mercadopago',
  mercadopago_payment_id text,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_address jsonb,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  customer_cpf text,
  notes text,
  ordered_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders (status);
create index if not exists orders_ordered_at_idx on orders (ordered_at desc);

-- Itens do pedido
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_brand text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- Reserva de estoque (checkout pendente)
create table if not exists stock_reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  quantity int not null check (quantity > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists stock_reservations_product_idx on stock_reservations (product_id);
create index if not exists stock_reservations_expires_idx on stock_reservations (expires_at);

-- RLS: leitura pública de produtos ativos
alter table products enable row level security;
alter table store_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table admin_users enable row level security;
alter table stock_reservations enable row level security;

create policy "products_public_read" on products
  for select using (active = true);

create policy "store_settings_public_read" on store_settings
  for select using (true);

-- Service role bypasses RLS; anon só lê catálogo

-- Trigger updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

create trigger customers_updated_at before update on customers
  for each row execute function set_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

create trigger store_settings_updated_at before update on store_settings
  for each row execute function set_updated_at();
