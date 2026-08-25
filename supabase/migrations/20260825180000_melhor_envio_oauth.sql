-- Melhor Envio OAuth (singleton — apenas service role)

create table if not exists melhor_envio_oauth_tokens (
  id int primary key default 1 check (id = 1),
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table melhor_envio_oauth_tokens enable row level security;

comment on table melhor_envio_oauth_tokens is
  'Tokens OAuth Melhor Envio da loja Iseul. Sem policies — apenas service role.';
