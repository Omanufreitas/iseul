-- Preenche nome/telefone dos inscritos a partir dos clientes do checkout

update waitlist_subscribers w
set
  name = coalesce(nullif(trim(w.name), ''), trim(c.full_name)),
  phone = coalesce(nullif(trim(w.phone), ''), nullif(trim(c.phone), ''))
from customers c
where lower(c.email) = lower(w.email)
  and (
    nullif(trim(w.name), '') is null
    or nullif(trim(w.phone), '') is null
  );
