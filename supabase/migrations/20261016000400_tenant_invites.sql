-- SECURITY: handle_new_user put anyone whose signup metadata carried a tenant_id into that tenant. Signup metadata is
-- whatever the client sends (signUp options.data), so a stranger could join any company whose id they had. An
-- invite is now a row only the server writes (service role, /api/admin/invite); a new account joins the tenant its
-- e-mail was invited to, and nothing else. (Column named invited_to: this is not tenant data, no RLS policies.)
create table public.tenant_invites (
  email text primary key check (email = lower(email)),
  invited_to uuid not null references public.tenants (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.tenant_invites enable row level security; -- no policies: service role only
revoke all on public.tenant_invites from anon, authenticated; -- hosted Supabase grants new tables by default
grant select, insert, update, delete on public.tenant_invites to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_tenant_id uuid;
  invited_tenant uuid;
  display_name text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );
begin
  delete from public.tenant_invites
   where email = lower(new.email) and created_at > now() - interval '30 days'
  returning invited_to into invited_tenant;

  if invited_tenant is not null then
    insert into public.profiles (id, tenant_id, full_name, email, role)
    values (new.id, invited_tenant, display_name, new.email, 'member');
    return new;
  end if;

  insert into public.tenants (name)
  values (coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), 'My Organisation'))
  returning id into new_tenant_id;

  insert into public.profiles (id, tenant_id, full_name, email, role)
  values (new.id, new_tenant_id, display_name, new.email, 'admin');
  return new;
end;
$$;
