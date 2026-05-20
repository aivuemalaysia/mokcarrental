create table if not exists public.admin_auth (
  id text primary key default 'singleton',
  email text not null default 'admin@mokcarrental.com',
  password_hash text,
  password_salt text,
  password_iterations integer not null default 210000,
  updated_at timestamptz not null default now()
);

alter table public.admin_auth enable row level security;

insert into public.admin_auth (id)
values ('singleton')
on conflict (id) do nothing;
