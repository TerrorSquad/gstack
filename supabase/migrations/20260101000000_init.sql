create extension if not exists pgcrypto;

create type public.user_role as enum ('member', 'admin');

-- One profile row per auth user, created automatically on signup by the
-- handle_new_user trigger below. Role defaults to 'member'; promote to 'admin'
-- by hand in the DB (this starter has no self-service admin promotion).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

-- The example CRUD resource. Owned by a single user; RLS scopes every row to
-- its owner. Swap this table for your own domain and the pages/composable follow.
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_id_idx on public.notes (user_id);

-- Security-definer helper so RLS policies can read the caller's role without
-- recursively triggering RLS on profiles.
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Bootstrap a profile whenever a new auth user is created. full_name comes from
-- the signUp options.data metadata; falls back to the email local-part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: profiles readable by any signed-in user (directory); each user edits
-- only their own. Notes are private to their owner for every operation.
alter table public.profiles enable row level security;
alter table public.notes enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.uid() is not null);

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "notes_owner_all" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS filters rows; the authenticated role still needs base privileges to query.
grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
