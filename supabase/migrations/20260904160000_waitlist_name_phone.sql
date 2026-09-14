-- Nome e telefone na lista de inscritos

alter table waitlist_subscribers
  add column if not exists name text not null default '',
  add column if not exists phone text not null default '';
