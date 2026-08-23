-- Campos fiscais e sync Bling em produtos

alter table products
  add column if not exists ncm text,
  add column if not exists tax_origin smallint not null default 1,
  add column if not exists unit text not null default 'UN',
  add column if not exists bling_product_id text,
  add column if not exists bling_sync_status text,
  add column if not exists bling_sync_error text;

create index if not exists products_bling_sync_status_idx on products (bling_sync_status);

comment on column products.ncm is 'NCM (8 dígitos) — obrigatório para NF-e no Bling';
comment on column products.tax_origin is 'Origem fiscal (0=nacional, 1=importação direta, etc.)';
comment on column products.unit is 'Unidade comercial (UN, PÇ, etc.)';
