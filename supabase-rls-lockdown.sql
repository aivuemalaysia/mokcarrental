-- Lock down Row Level Security: anon role gets zero access to app data tables.
-- App code uses the service_role key (which bypasses RLS), so this is safe.
do $$
declare
  t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in ('storage', 'storage.objects', 'storage.buckets', 'storage.s3_multipart_uploads')
  loop
    execute format(
      'alter table public.%I enable row level security',
      t.tablename
    );
    raise notice 'RLS enabled on %', t.tablename;
  end loop;
end
$$;
