begin;
create extension if not exists pgtap;
select plan(11);
-- tenant A: admin a + member m; tenant B: admin b
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@t.test', '{"company_name":"A","full_name":"A"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@t.test', '{"company_name":"B","full_name":"B"}'),
  ('00000000-0000-0000-0000-00000000000c', 'm@t.test', '{"company_name":"M","full_name":"M"}');
update public.profiles set tenant_id = (select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), role = 'member'
 where id = '00000000-0000-0000-0000-00000000000c';
create temp table tb as select tenant_id from public.profiles where id = '00000000-0000-0000-0000-00000000000b';
grant select on tb to authenticated;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
set local role authenticated;

-- a member edits only their display fields
select throws_ok($$update public.profiles set role = 'admin' where id = auth.uid()$$, '42501', null, 'a member cannot make themselves admin');
select throws_ok($$update public.profiles set tenant_id = (select tenant_id from tb) where id = auth.uid()$$, '42501', null, 'nobody can move themselves into another tenant');
select lives_ok($$update public.profiles set full_name = 'Marko' where id = auth.uid()$$, 'own name can still be changed');

-- preferences only through set_ui_prefs, known keys and values only
select is(public.set_ui_prefs('{"locale":"sr","theme":"dark"}') ->> 'theme', 'dark', 'known preferences are saved');
select is(public.set_ui_prefs('{"accent":"teal","font":"geist"}') ->> 'locale', 'sr', 'and merged, not replaced');
select is(public.set_ui_prefs('{"textSize":125,"motion":"reduce","contrast":"high","staySignedIn":true}') ->> 'textSize', '125', 'display preferences');
select throws_like($$select public.set_ui_prefs('{"role":"admin"}')$$, 'E_PREFS%', 'unknown keys are refused');
select throws_like($$select public.set_ui_prefs('{"accent":"#ff0000"}')$$, 'E_PREFS%', 'only the shipped palettes');
select throws_like($$select public.set_ui_prefs('{"textSize":300}')$$, 'E_PREFS%', 'only the offered text sizes');
select throws_like($$update public.profiles set ui_prefs = '{}' where id = auth.uid()$$, '%permission denied%', 'no direct writes');
reset role;
select is((select role::text from public.profiles where id = '00000000-0000-0000-0000-00000000000c'), 'member', 'role unchanged');
select * from finish();
rollback;
