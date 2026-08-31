-- Opt-in de marketing no checkout + cupom primeira compra

alter table customers
  add column if not exists marketing_opt_in boolean not null default false;

alter table customers
  add column if not exists marketing_opt_in_at timestamptz;

alter table coupons
  add column if not exists first_purchase_only boolean not null default false;
