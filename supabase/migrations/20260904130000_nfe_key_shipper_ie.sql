alter table orders
  add column if not exists nfe_key text;

alter table store_settings
  add column if not exists shipper_state_register text default '';

comment on column orders.nfe_key is 'Chave de acesso NF-e (44 dígitos) para Melhor Envio';
comment on column store_settings.shipper_state_register is 'Inscrição estadual do remetente (Melhor Envio envios comerciais)';
