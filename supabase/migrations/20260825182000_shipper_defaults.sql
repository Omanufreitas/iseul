-- Endereço remetente Iseul (Melhor Envio) — preenche se ainda vazio

update store_settings
set
  shipper_name = coalesce(nullif(trim(shipper_name), ''), 'Iseul'),
  shipper_document = coalesce(nullif(trim(shipper_document), ''), '63829102000134'),
  shipper_email = coalesce(nullif(trim(shipper_email), ''), 'contato@iseul.com.br'),
  shipper_street = coalesce(nullif(trim(shipper_street), ''), 'Rua Cacimba'),
  shipper_number = coalesce(nullif(trim(shipper_number), ''), '868'),
  shipper_neighborhood = coalesce(nullif(trim(shipper_neighborhood), ''), 'Jardim Canguru'),
  shipper_city = coalesce(nullif(trim(shipper_city), ''), 'Campo Grande'),
  shipper_state = coalesce(nullif(trim(shipper_state), ''), 'MS')
where id = 1;
