-- Tipos de pele gerenciáveis pelo ADM (criar e renomear, como as categorias)
create table if not exists skin_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into skin_types (slug, label, sort_order) values
  ('oleosa', 'Pele oleosa', 1),
  ('seca', 'Pele seca', 2),
  ('mista', 'Pele mista', 3),
  ('normal', 'Pele normal', 4),
  ('sensivel', 'Pele sensível', 5),
  ('todos', 'Todos os tipos de pele', 6)
on conflict (slug) do nothing;

alter table skin_types enable row level security;
