create table if not exists public.checkouts_iniciados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text,
  itens jsonb not null,
  total numeric(10,2) not null,
  aceita_whatsapp boolean not null default false,
  criado_em timestamptz not null default now(),
  cupom_codigo text,
  cupom_expira_em timestamptz,
  robo_status text,
  robo_motivo text,
  robo_em timestamptz
);

create index if not exists checkouts_iniciados_criado_em_idx on public.checkouts_iniciados (criado_em);
create index if not exists checkouts_iniciados_telefone_idx on public.checkouts_iniciados (telefone);

alter table public.checkouts_iniciados enable row level security;
