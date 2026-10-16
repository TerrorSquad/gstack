begin;
create extension if not exists pgtap;
select plan(7);
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000a', 'a@t.test', '{"company_name":"A"}');
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000c', 'c@t.test', '{"company_name":"C"}');
update public.profiles set role = 'member' where id = '00000000-0000-0000-0000-00000000000c';

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
set local role authenticated;
select throws_like($$select public.create_api_key('x')$$, 'E_FORBIDDEN%', 'members cannot create keys');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
set local role authenticated;
create temp table k as select public.create_api_key('Scale') key;
select ok((select key from k) like 'sk_%', 'the key is returned once');
select is((select count(*)::int from public.api_key where key_hash <> (select key from k)), 1, 'only its hash is stored');
select throws_like($$select public.api_key_tenant('x')$$, '%permission denied%', 'clients cannot resolve keys');
reset role;
select is(public.api_key_tenant((select key from k)), (select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'the server resolves the key to its company');
set local role authenticated;
select public.revoke_api_key((select id from public.api_key limit 1));
reset role;
select is(public.api_key_tenant((select key from k)), null, 'a revoked key resolves to nothing');
select is(public.api_key_tenant('sk_wrong'), null, 'an unknown key resolves to nothing');
select * from finish();
rollback;
