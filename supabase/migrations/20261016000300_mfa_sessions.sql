-- Two-factor login enforced in the database, not just the UI: once a user has a verified authenticator, every
-- tenant table is invisible (and unwritable) to a session that has not passed the second factor (JWT aal = aal2).
-- profiles stays readable so the app can show the code prompt; tenants carries no business data.
-- A NEW TENANT TABLE needs the same policy: supabase/tests/mfa.test.sql fails until it has one.
create function public.mfa_ok() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified')
$$;
grant execute on function public.mfa_ok() to authenticated;

do $$
declare t text;
begin
  for t in select c.table_name from information_schema.columns c
             join information_schema.tables tb using (table_schema, table_name)
            where c.table_schema = 'public' and c.column_name = 'tenant_id' and tb.table_type = 'BASE TABLE'
              and c.table_name not in ('profiles')
  loop
    execute format('create policy mfa_required on public.%I as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()))', t);
  end loop;
end $$;

-- Recovery codes: Supabase Auth has none. Ten one-time codes, bcrypt-hashed. Using one (from a password-only
-- session) removes the user's authenticators, so they can sign in and enrol a new one. Functions only.
create table public.mfa_recovery_code (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  used_at timestamptz
);
create index on public.mfa_recovery_code (user_id);
alter table public.mfa_recovery_code enable row level security;  -- no policies: invisible to clients

create table public.mfa_recovery_attempt (user_id uuid not null references auth.users (id) on delete cascade, at timestamptz not null default now());
alter table public.mfa_recovery_attempt enable row level security;
-- hosted Supabase grants every new public table to anon/authenticated; these are reached through functions only
revoke all on public.mfa_recovery_code, public.mfa_recovery_attempt from anon, authenticated;

create function public.generate_recovery_codes() returns setof text
language plpgsql volatile security definer set search_path = '' as $$
declare c text;
begin
  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception 'E_MFA: confirm your authenticator code first' using errcode = '42501';
  end if;
  delete from public.mfa_recovery_code where user_id = auth.uid();
  for i in 1..10 loop
    c := upper(encode(extensions.gen_random_bytes(5), 'hex'));
    c := substr(c, 1, 5) || '-' || substr(c, 6, 5);
    insert into public.mfa_recovery_code (user_id, code_hash) values (auth.uid(), extensions.crypt(c, extensions.gen_salt('bf')));
    return next c;
  end loop;
end $$;

create function public.use_recovery_code(p_code text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare v_id uuid; v_code text := upper(trim(p_code));
begin
  if auth.uid() is null then return false; end if;
  -- ponytail: 5 wrong tries per hour; codes are 40 bits, so guessing is hopeless anyway
  if (select count(*) from public.mfa_recovery_attempt where user_id = auth.uid() and at > now() - interval '1 hour') >= 5 then
    raise exception 'E_MFA_LOCKED: too many attempts, try again in an hour' using errcode = 'P0001';
  end if;
  select id into v_id from public.mfa_recovery_code
   where user_id = auth.uid() and used_at is null and code_hash = extensions.crypt(v_code, code_hash) limit 1;
  if v_id is null then
    insert into public.mfa_recovery_attempt (user_id) values (auth.uid());
    return false;
  end if;
  update public.mfa_recovery_code set used_at = now() where id = v_id;
  delete from auth.mfa_factors where user_id = auth.uid();
  return true;
end $$;

create function public.recovery_codes_left() returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.mfa_recovery_code where user_id = auth.uid() and used_at is null
$$;
revoke execute on function public.generate_recovery_codes(), public.use_recovery_code(text), public.recovery_codes_left() from public, anon;
grant execute on function public.generate_recovery_codes(), public.use_recovery_code(text), public.recovery_codes_left() to authenticated;

-- Signed-in devices: list my sessions, end one remotely. Ending a session deletes it (its refresh tokens cascade),
-- so that device is signed out when its access token expires (at most the JWT expiry, 1 h).
create function public.my_sessions()
returns table (id uuid, created_at timestamptz, last_seen timestamptz, user_agent text, ip text, current boolean)
language sql stable security definer set search_path = '' as $$
  select s.id, s.created_at, coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at), s.user_agent, host(s.ip),
         s.id::text = coalesce(auth.jwt() ->> 'session_id', '')
    from auth.sessions s
   where s.user_id = auth.uid()
   order by 3 desc
$$;

create function public.end_session(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_id::text = coalesce(auth.jwt() ->> 'session_id', '') then
    raise exception 'E_SESSION: use Sign out for this device' using errcode = 'P0001';
  end if;
  delete from auth.sessions where id = p_id and user_id = auth.uid();
end $$;
revoke execute on function public.my_sessions(), public.end_session(uuid) from public, anon;
grant execute on function public.my_sessions(), public.end_session(uuid) to authenticated;
