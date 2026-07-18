create extension if not exists pgcrypto;

create type public.user_role as enum ('member', 'admin');
create type public.notification_type as enum ('note_created');

-- Multi-tenancy: one row per organisation. Every other table carries tenant_id
-- and RLS scopes rows to the caller's tenant via current_tenant_id(). This is
-- the single-DB / shared-schema model — simplest to run, RLS is the boundary.
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One profile row per auth user, created by handle_new_user on signup. The first
-- user of a tenant is its admin (self-service registration creates the tenant).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

create index profiles_tenant_id_idx on public.profiles (tenant_id);

-- The example CRUD resource, owned by a user within a tenant.
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_tenant_id_idx on public.notes (tenant_id);
create index notes_user_id_idx on public.notes (user_id);

-- In-app notification feed. A DB trigger fans these out to tenant admins when a
-- member creates a note; a Supabase DB webhook can mirror each row to email.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type public.notification_type not null,
  note_id uuid references public.notes (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id);

-- Security-definer helpers so RLS policies can read the caller's tenant/role
-- without recursively triggering RLS on profiles.
-- ponytail: reads the profile row each call. For high-traffic apps, move
-- tenant_id into a custom JWT claim via a Supabase access-token hook and read it
-- from auth.jwt() instead — same call sites, no per-request lookup.
create or replace function public.current_tenant_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Bootstrap a tenant + admin profile on signup. company_name comes from the
-- signUp options.data metadata; every self-service signup creates a new tenant
-- and makes the registrant its admin. (Add an invite flow to put more users in
-- one tenant; the seed does this directly.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_tenant_id uuid;
begin
  insert into public.tenants (name)
  values (coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), 'My Organisation'))
  returning id into new_tenant_id;

  insert into public.profiles (id, tenant_id, full_name, email, role)
  values (
    new.id,
    new_tenant_id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fan a new note out to every admin in the same tenant (except the author).
create or replace function public.notify_admins_on_note()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (tenant_id, recipient_id, actor_id, type, note_id)
  select new.tenant_id, p.id, new.user_id, 'note_created', new.id
  from public.profiles p
  where p.tenant_id = new.tenant_id and p.role = 'admin' and p.id <> new.user_id;
  return new;
end;
$$;

create trigger on_note_created
  after insert on public.notes
  for each row execute function public.notify_admins_on_note();

-- RLS. Every policy is tenant-scoped; the boundary is the DB, not app code.
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.notifications enable row level security;

create policy "tenants_select_own" on public.tenants
  for select using (id = public.current_tenant_id());

create policy "profiles_select_same_tenant" on public.profiles
  for select using (tenant_id = public.current_tenant_id());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Notes: owner has full control; a tenant admin may read (so a "member created a
-- note" notification is actionable). Writes stay owner-only.
create policy "notes_select_owner_or_admin" on public.notes
  for select using (
    tenant_id = public.current_tenant_id()
    and (user_id = auth.uid() or public.current_role() = 'admin')
  );

create policy "notes_insert_own" on public.notes
  for insert with check (tenant_id = public.current_tenant_id() and user_id = auth.uid());

create policy "notes_update_own" on public.notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notes_delete_own" on public.notes
  for delete using (user_id = auth.uid());

create policy "notifications_select_own" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- RLS filters rows; the authenticated role still needs base privileges.
grant usage on schema public to authenticated;
grant select on public.tenants to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, update on public.notifications to authenticated;

-- The service_role bypasses RLS but still needs table privileges — the new
-- Supabase default no longer auto-exposes public tables. Used by scripts/ (seed)
-- and the server routes via serverSupabaseServiceRole().
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
