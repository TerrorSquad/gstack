import { defineStore } from 'pinia'

import type { Profile } from '~/types'

import { mapProfile } from '~/utils/mappers'

export const useAuthStore = defineStore('auth', () => {
  // useSupabaseUser() holds the JWT payload (sub = user id).
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // useState so SSR serialises the resolved profile into the payload — a plain
  // ref resets to null on the client before hydration middleware runs, racing
  // any page that reads the profile on mount.
  const profile = useState<Profile | null>('auth_profile', () => null)

  async function ensureProfile() {
    const authUserId = user.value?.sub
    if (!authUserId) {
      profile.value = null
      return null
    }
    if (profile.value?.id === authUserId) {
      return profile.value
    }
    // profiles.id IS the auth user id (see handle_new_user trigger).
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .single()
    if (error || !data) {
      profile.value = null
      return null
    }
    profile.value = mapProfile(data)
    return profile.value
  }

  const role = computed(() => profile.value?.role ?? null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // useSupabaseUser() syncs via an onAuthStateChange listener that isn't
    // sequenced with signInWithPassword's promise, so sync it explicitly before
    // navigating or the next middleware run sees a stale "logged out" state.
    const { data } = await supabase.auth.getClaims()
    user.value = data?.claims ?? null
    await ensureProfile()
  }

  // Returns true if a session was issued (email confirmation off → logged in
  // now), false if the user must confirm their email before logging in.
  async function register(fullName: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    if (!data.session) return false
    const { data: claims } = await supabase.auth.getClaims()
    user.value = claims?.claims ?? null
    await ensureProfile()
    return true
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
    profile.value = null
  }

  return {
    user,
    profile,
    role,
    isAuthenticated,
    ensureProfile,
    login,
    register,
    resendConfirmation,
    logout,
  }
})
