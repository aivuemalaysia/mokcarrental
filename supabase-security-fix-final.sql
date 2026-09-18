-- Final security lockdown. Idempotent: safe to re-run.
-- Run this whole block in ONE new SQL tab, then click Run.

-- 1. Drop the duplicate table (fixes the red error)
drop table if exists public.business_applications2 cascade;

-- 2. Confirm row level security is ON for all app tables
alter table public.inquiries enable row level security;
alter table public.inquiries_events enable row level security;
alter table public.business_applications enable row level security;
alter table public.business_application_images enable row level security;
alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.contacts enable row level security;
alter table public.login_attempts enable row level security;
alter table public.rate_limit_tracker enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_roles enable row level security;
alter table public.content_sections enable row level security;

-- 3. Drop EVERY permissive RLS policy on app tables.
--    We look up the exact policy names first, then drop them by name.
do $$
declare
  v_sql text;
  r record;
begin
  for r in
    select p.polname, c.relname
    from pg_policy p
    join pg_class c on p.polrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public'
      and c.relname in (
        'inquiries','inquiries_events','business_applications',
        'business_application_images','cars','car_images','contacts',
        'login_attempts','rate_limit_tracker','audit_logs','user_roles',
        'content_sections'
      )
      and (p.polpermissive::text in ('o','t','true'))
  loop
    v_sql := format('drop policy %I on public.%I', r.polname, r.relname);
    execute v_sql;
    raise notice 'dropped policy % on %', r.polname, r.relname;
  end loop;
end
$$;

-- 4. Lock helper functions from anon + authenticated users
revoke execute on function public.pgrst_reload_schema() from anon, authenticated;

do $$
declare
  v_sql text;
  f record;
begin
  for f in
    select p.oid, p.proname, pg_get_function_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'update_updated_at_at_column',
        'update_content_sections_updated_at',
        'set_updated_at'
      )
  loop
    v_sql := format('revoke execute on function public.%I(%s) from anon, authenticated',
                   f.proname, coalesce(f.args, ''));
    execute v_sql;
    raise notice 'revoked %(%s)', f.proname, coalesce(f.args, '');
  end loop;
end
$$;

-- 5. Sanity check: permissive policies left on app tables (should be empty)
select p.polname, c.relname
from pg_policy p
join pg_class c on p.polrelid = c.oid
join pg_namespace n on c.relnamespace = n.oid
where n.nspname = 'public'
  and c.relname in (
    'inquiries','inquiries_events','business_applications',
    'business_application_images','cars','car_images','contacts',
    'login_attempts','rate_limit_tracker','audit_logs','user_roles',
    'content_sections'
  )
  and (p.polpermissive::text in ('o','t','true'));
