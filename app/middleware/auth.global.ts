export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.public) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  await auth.ensureProfile()

  if (!auth.profile) {
    return navigateTo('/login')
  }

  // Two-factor login: an account with an authenticator must pass it before anything else (the database enforces the
  // same with aal2-only RLS; this routes the user to the code prompt instead of showing empty pages).
  if (import.meta.client && to.path !== '/auth/mfa') {
    const { data } = await useSupabaseClient().auth.mfa.getAuthenticatorAssuranceLevel()
    if (data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2') return navigateTo('/auth/mfa')
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role!)) {
    return navigateTo('/dashboard')
  }
})
