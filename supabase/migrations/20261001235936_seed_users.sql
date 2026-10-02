insert into public.users (id, daycare_id, role, status, full_name)
select
  au.id,
  (select id from public.daycares where name = 'Guardería Sala Soles'),
  'staff',
  'active',
  'Sebastián'
from auth.users au
where au.email = 'sebastian@google.com'
on conflict (id) do nothing;
