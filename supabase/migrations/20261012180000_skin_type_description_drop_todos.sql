alter table skin_types add column if not exists description text not null default '';

update products
set skin_types = array_remove(skin_types, 'todos')
where 'todos' = any(skin_types);

delete from skin_types where slug = 'todos';
