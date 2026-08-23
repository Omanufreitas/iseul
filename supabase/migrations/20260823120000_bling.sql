-- Bling — pedidos de venda e NF-e

alter table products
  add column if not exists sku text;

create index if not exists products_sku_idx on products (sku) where sku is not null;

alter table orders
  add column if not exists bling_order_id text,
  add column if not exists bling_sync_status text,
  add column if not exists bling_sync_error text,
  add column if not exists nfe_number text,
  add column if not exists nfe_url text;

create index if not exists orders_bling_sync_status_idx on orders (bling_sync_status);

-- Tokens OAuth Bling (singleton — apenas service role)
create table if not exists bling_oauth_tokens (
  id int primary key default 1 check (id = 1),
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table bling_oauth_tokens enable row level security;

comment on table bling_oauth_tokens is
  'Tokens OAuth Bling API v3 da loja Iseul. Sem policies — apenas service role.';
