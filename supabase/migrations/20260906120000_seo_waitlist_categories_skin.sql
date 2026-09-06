-- Categorias gerenciáveis pelo ADM
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into product_categories (slug, label, sort_order) values
  ('solar', 'Protetor solar', 1),
  ('serum', 'Sérum & ampola', 2),
  ('hidratante', 'Hidratante & creme', 3),
  ('limpeza', 'Limpeza', 4),
  ('pads', 'Pads & esfoliante', 5),
  ('olhos', 'Área dos olhos', 6),
  ('dispositivo', 'Dispositivo', 7)
on conflict (slug) do nothing;

alter table product_categories enable row level security;

-- Tipos de pele nos produtos
alter table products add column if not exists skin_types text[] not null default '{}';

-- Interesse por produto (Avise-me quando chegar)
alter table waitlist_subscribers add column if not exists product_id uuid references products(id) on delete set null;
alter table waitlist_subscribers add column if not exists product_name text;

drop index if exists waitlist_subscribers_email_idx;
create unique index if not exists waitlist_subscribers_email_landing_idx
  on waitlist_subscribers (email)
  where product_id is null;
create unique index if not exists waitlist_subscribers_email_product_idx
  on waitlist_subscribers (email, product_id)
  where product_id is not null;

-- Pedidos cancelados: pagamento pendente → cancelado (legado)
update orders
set payment_status = 'cancelado'
where status = 'cancelado'
  and payment_status = 'pendente';
