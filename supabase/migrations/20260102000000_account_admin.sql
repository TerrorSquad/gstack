-- Phase 3: account self-service + admin management.

-- Avatars ---------------------------------------------------------------------
alter table public.profiles add column avatar_url text;

-- Public bucket for avatars; each user's files live under a folder named by their
-- auth uid, and RLS lets a user write only inside their own folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Invites ---------------------------------------------------------------------
-- An invited user carries a tenant_id in their signup metadata (set by the admin
-- invite route) and joins that tenant as a member. Everyone else self-registers a
-- new tenant as its admin (the original behaviour).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_tenant_id uuid;
  invited_tenant uuid := nullif(new.raw_user_meta_data ->> 'tenant_id', '')::uuid;
  display_name text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );
begin
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
