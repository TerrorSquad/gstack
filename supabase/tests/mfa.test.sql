begin;
create extension if not exists pgtap;
select plan(6);

-- every tenant table (tenant_id column) except profiles carries the restrictive aal2 policy
select is(
  (select array_agg(c.table_name::text order by c.table_name)
     from information_schema.columns c join information_schema.tables tb using (table_schema, table_name)
    where c.table_schema = 'public' and c.column_name = 'tenant_id' and tb.table_type = 'BASE TABLE'
      and c.table_name <> 'profiles'
      and not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = c.table_name
                       and p.policyname = 'mfa_required' and p.permissive = 'RESTRICTIVE')),
  null, 'every tenant table requires the second factor once a user has one (add the mfa_required policy)');

insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000a', 'a@t.test', '{"company_name":"A"}');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","aal":"aal1"}', true);
set local role authenticated;
select ok(public.mfa_ok(), 'no authenticator: a password session passes');
select throws_like($$select public.generate_recovery_codes()$$, 'E_MFA%', 'recovery codes need a confirmed second factor');
reset role;

insert into auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at)
values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 't', 'totp', 'verified', now(), now());
set local role authenticated;
select ok(not public.mfa_ok(), 'with an authenticator, aal1 is not enough');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated","aal":"aal2"}', true);
select is((select count(*)::int from public.generate_recovery_codes()), 10, 'ten recovery codes');
select ok(public.mfa_ok(), 'aal2 passes');
select * from finish();
rollback;
