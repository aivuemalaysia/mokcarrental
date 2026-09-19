-- Complete security fix: locks down all app tables, removes permissive
-- anon rules, and locks the SECURITY DEFINER helper functions.
-- Safe to re-run; every statement is idempotent.

-- 1. Drop the duplicate table nobody uses
drop table if exists public.business_applications2 cascade;

-- 2. Enable row level security on every app table
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

-- 3. Remove the "anyone can do anything" rules (idempotent)
drop policy if exists "Public can view active content sections" on public.content_sections;
drop policy if exists "allow anon read inquiries" on public.inquiries;
drop policy if exists "allow anon read audit_logs" on public.audit_logs;
drop policy if exists "allow anon read contacts" on public.contacts;
drop policy if exists "allow anon read inquiries_events" on public.inquiries_events;
drop policy if exists "allow anon read user_roles" on public.user_roles;
do $$
declare
  pol record;
begin
  -- Remove every permissive policy left on app tables
  for pol in
    select p.prolabel, n.nspname, c.relname
    from pg_policy p
    join pg_class c on p.tablename = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public'
      and (p.permissive = 'OR'
           or p.usescols is null)
      and c.relname in (
        'inquiries','inquiries_events','business_applications',
        'business_application_images','cars','car_images','contacts',
        'login_attempts','rate_limit_tracker','audit_logs','user_roles',
        'content_sections'
      )
  loop
    execute format('drop policy %I on public.%I', pol.prolabel, pol.relname);
    raise notice 'dropped permissive policy % on %', pol.prolabel, pol.relname;
  end loop;
end
$$;

-- 4. Lock the SECURITY DEFINER helper functions:
--    revoke from anon and authenticated. The app's service_role key
--    keeps full access, so the website is unaffected.
revoke execute on function public.pgrst_reload_schema() from anon, authenticated;
do $$
declare
  f record;
begin
  for f in
    select p.proname,
           coalesce(
             array(
               select format('%s', pg_get_function_identity_arguments(f.oid))
             ),
             '{}'
           ) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'update_updated_at_at_column',
        'update_content_sections_updated_at',
        'set_updated_at',
        'pgrst_reload_schema'
      )
  loop
    begin
      if f.args = '{}' then
        execute format(
          'revoke execute on function public.%I() from anon, authenticated',
          f.proname
        );
      else
        execute format(
          'revoke execute on function public.%I(%s) from anon, authenticated',
          f.proname, string_agg(f.args, ', ')
        );
      end if;
      raise notice 'revoked execute on public.%', f.proname;
    exception when others then
      raise notice 'skipped %: %', f.proname, sqlerrm;
    end;
  end loop;
end
$$;

-- 5. Verify: show which app tables still lack RLS (should be empty)
select tablename
from pg_tables t
join pg_class c on c.relname = t.tablename
join pg_namespace n on n.oid = c.relnamespace
where t.schemaname = 'public'
  and n.nspname = 'public'
  and c.relrowsecurity = false
  and t.tablename not like '\_%' escape '\'
order by tablename;
