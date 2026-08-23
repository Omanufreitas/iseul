-- Galeria de fotos por produto (image_url continua como capa / compatibilidade)

alter table products
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

update products
set image_urls = jsonb_build_array(image_url)
where coalesce(trim(image_url), '') <> ''
  and (image_urls = '[]'::jsonb or image_urls is null);
