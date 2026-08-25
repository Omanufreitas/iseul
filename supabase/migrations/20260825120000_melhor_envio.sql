-- Melhor Envio: remetente + etiquetas + rastreio

alter table store_settings
  add column if not exists shipper_name text default 'Iseul',
  add column if not exists shipper_document text default '63829102000134',
  add column if not exists shipper_phone text default '',
  add column if not exists shipper_email text default 'contato@iseul.com.br',
  add column if not exists shipper_street text default '',
  add column if not exists shipper_number text default '',
  add column if not exists shipper_complement text default '',
  add column if not exists shipper_neighborhood text default '',
  add column if not exists shipper_city text default '',
  add column if not exists shipper_state text default 'MS';

alter table orders
  add column if not exists tracking_code text,
  add column if not exists shipping_method text,
  add column if not exists shipping_service_id text,
  add column if not exists melhor_envio_cart_id text,
  add column if not exists melhor_envio_order_id text,
  add column if not exists melhor_envio_label_url text,
  add column if not exists melhor_envio_status text,
  add column if not exists melhor_envio_error text;

comment on column orders.shipping_service_id is 'ID do serviço Melhor Envio escolhido no checkout';
comment on column orders.melhor_envio_status is 'pending | in_cart | paid | generated | error';
