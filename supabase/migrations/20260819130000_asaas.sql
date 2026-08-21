-- Asaas — IDs de pagamento e checkout

alter table orders add column if not exists asaas_payment_id text;
alter table orders add column if not exists asaas_checkout_id text;

create index if not exists orders_asaas_payment_id_idx on orders (asaas_payment_id);
