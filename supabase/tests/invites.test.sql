begin;
create extension if not exists pgtap;
select plan(4);
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000a', 'a@t.test', '{"company_name":"A"}');
create temp table ta as select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000a';

-- a stranger who puts the tenant id into their own signup metadata gets their own company, not this one
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-00000000000b', 'x@t.test', jsonb_build_object('tenant_id', (select tenant_id from ta)));
select isnt((select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), (select tenant_id from ta), 'signup metadata cannot pick a tenant');
select is((select role::text from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'admin', 'the stranger owns a fresh company');

-- an invite the server recorded: that e-mail joins as a member, and the invite is used up
insert into public.tenant_invites (email, invited_to) values ('m@t.test', (select tenant_id from ta));
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000c', 'M@t.test');
select is((select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000c'), (select tenant_id from ta), 'an invited e-mail joins the inviting tenant');
select is((select count(*)::int from public.tenant_invites), 0, 'the invite is used once');
select * from finish();
rollback;
