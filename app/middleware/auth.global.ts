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

  if (to.meta.roles && !to.meta.roles.includes(auth.role!)) {
    return navigateTo('/dashboard')
  }
})
