import { normalizePrefs, type UiPrefs } from '~/utils/uiPrefs'

// Synced user preferences: read from the profile, written through set_ui_prefs, applied at once.
export function useUiPrefs() {
  const auth = useAuthStore()
  const supabase = useSupabaseClient()
  const prefs = computed<UiPrefs>(() => normalizePrefs(auth.profile?.uiPrefs))

  async function patch(partial: Partial<UiPrefs>) {
    if (!auth.profile) return
    // optimistic: the UI follows immediately, the server merges and validates
    auth.profile = { ...auth.profile, uiPrefs: { ...auth.profile.uiPrefs, ...partial } }
    const { data, error } = await supabase.rpc(
      'set_ui_prefs' as never,
      { p_prefs: partial } as never,
    )
    if (error) throw error
    if (auth.profile && data)
      auth.profile = { ...auth.profile, uiPrefs: data as Record<string, unknown> }
  }
  return { prefs, patch }
}
