create table if not exists public.business_applications (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  contact_number text not null,
  email text null,
  business_name text null,
  car_make text null,
  car_model text null,
  car_year integer null,
  notes text null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_application_images (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.business_applications(id) on delete cascade,
  sort_order integer not null default 0,
  original_path text not null,
  medium_path text not null,
  thumb_path text not null,
  original_url text not null,
  medium_url text not null,
  thumb_url text not null,
  width integer null,
  height integer null,
  bytes integer null,
  content_type text null,
  sha256 text null,
  created_at timestamptz not null default now()
);

create index if not exists business_applications_status_idx on public.business_applications(status);
create index if not exists business_applications_created_at_idx on public.business_applications(created_at desc);
create index if not exists business_application_images_app_id_idx on public.business_application_images(application_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists business_applications_set_updated_at on public.business_applications;
create trigger business_applications_set_updated_at
before update on public.business_applications
for each row
execute function public.set_updated_at();

alter table public.business_applications enable row level security;
alter table public.business_application_images enable row level security;

