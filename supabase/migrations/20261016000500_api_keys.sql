-- API keys for integrations: an admin creates a key; only its SHA-256 is stored. The read-only REST API
-- (/api/v1/*, server/utils/apiKey.ts) resolves a key to its tenant with api_key_tenant() and filters every query by
-- that tenant.
create table public.api_key (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default public.current_tenant_id() references public.tenants (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  prefix text not null,                 -- first characters, to recognise a key in the list
  key_hash text not null unique,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
alter table public.api_key enable row level security;
create policy api_key_admin_read on public.api_key for select
  using (tenant_id = (select public.current_tenant_id()) and (select public.current_role()) = 'admin');
create policy mfa_required on public.api_key as restrictive for all to authenticated
  using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
-- read-only to clients; writes go through the functions below
revoke all on public.api_key from anon, authenticated;
grant select on public.api_key to authenticated;
grant all on public.api_key to service_role;

create function public.create_api_key(p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare k text := 'sk_' || encode(extensions.gen_random_bytes(24), 'hex');
begin
  if public.current_role() <> 'admin' or not public.mfa_ok() then
    raise exception 'E_FORBIDDEN: only administrators create API keys' using errcode = '42501';
  end if;
  insert into public.api_key (tenant_id, name, prefix, key_hash)
    values (public.current_tenant_id(), p_name, left(k, 10), encode(extensions.digest(k, 'sha256'), 'hex'));
  return k;  -- shown once
end $$;

create function public.revoke_api_key(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if public.current_role() <> 'admin' or not public.mfa_ok() then
    raise exception 'E_FORBIDDEN: only administrators revoke API keys' using errcode = '42501';
  end if;
  update public.api_key set revoked_at = now() where id = p_id and tenant_id = public.current_tenant_id() and revoked_at is null;
end $$;

-- For the server only (service role): key → tenant, or nothing.
create function public.api_key_tenant(p_key text) returns uuid
language sql volatile security definer set search_path = '' as $$
  update public.api_key set last_used_at = now()
   where key_hash = encode(extensions.digest(p_key, 'sha256'), 'hex') and revoked_at is null
  returning tenant_id
$$;
revoke execute on function public.create_api_key(text), public.revoke_api_key(uuid), public.api_key_tenant(text) from public, anon, authenticated;
grant execute on function public.create_api_key(text), public.revoke_api_key(uuid) to authenticated;
grant execute on function public.api_key_tenant(text) to service_role;
