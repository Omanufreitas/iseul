-- Lista de espera (landing "em breve")

create table if not exists waitlist_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_subscribers_email_idx
  on waitlist_subscribers (email);

alter table waitlist_subscribers enable row level security;
