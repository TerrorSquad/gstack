-- SECURITY: "profiles_update_own" let a user update any column of their own row, so a member could set
-- role = 'admin' or move tenant_id into another company. Users may now only change their own display fields;
-- role changes go through the admin API (service role, same-tenant checks).
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;
