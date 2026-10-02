create type public.user_role   as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create table public.users (
  id                     uuid        primary key references auth.users (id) on delete cascade,
  daycare_id             uuid        not null references public.daycares (id),
  role                   public.user_role   not null,
  status                 public.user_status not null default 'active',
  full_name              text        not null,
  avatar_url             text,
  notify_on_post         boolean     not null default true,
  daily_summary_enabled  boolean     not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index users_daycare_id_idx on public.users (daycare_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;  -- sin policies: deny-by-default
