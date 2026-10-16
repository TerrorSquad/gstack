-- User preferences (app/utils/uiPrefs.ts): language, theme, accent, typeface, text size, motion, contrast and idle
-- sign-out. Synced on the profile so they follow the user across devices. Written only through set_ui_prefs, which
-- accepts known keys with valid values; the profile itself stays non-updatable by its owner (name/avatar only).
alter table public.profiles add column ui_prefs jsonb not null default '{}';

create function public.set_ui_prefs(p_prefs jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare k text; v jsonb; merged jsonb;
begin
  for k, v in select * from jsonb_each(coalesce(p_prefs, '{}')) loop
    if not (
         (k = 'locale' and v #>> '{}' in ('sr', 'en'))
      or (k = 'theme' and v #>> '{}' in ('system', 'light', 'dark'))
      or (k = 'accent' and v #>> '{}' in ('amber', 'blue', 'indigo', 'violet', 'teal', 'emerald'))
      or (k = 'font' and v #>> '{}' in ('classic', 'plex', 'geist', 'source', 'manrope', 'nunito'))
      or (k = 'textSize' and jsonb_typeof(v) = 'number' and v #>> '{}' in ('90', '100', '110', '125'))
      or (k = 'motion' and v #>> '{}' in ('system', 'reduce', 'full'))
      or (k = 'contrast' and v #>> '{}' in ('normal', 'high'))
      or (k = 'staySignedIn' and jsonb_typeof(v) = 'boolean')
    ) then
      raise exception 'E_PREFS: invalid preference %', k using errcode = 'P0001';
    end if;
  end loop;
  update public.profiles set ui_prefs = ui_prefs || coalesce(p_prefs, '{}') where id = auth.uid()
  returning ui_prefs into merged;
  return merged;
end $$;
revoke all on function public.set_ui_prefs(jsonb) from public, anon;
grant execute on function public.set_ui_prefs(jsonb) to authenticated;
