// Auto-starts the onboarding tour once, on the first authenticated dashboard
// visit, when NUXT_PUBLIC_TOUR_ENABLED is on. No-ops otherwise. Kept in the tour
// layer (not the dashboard page) so the whole feature stays removable.
//
// Watches route + auth rather than a single afterEach hook, because on a full
// page load the nav (tour targets) renders and auth hydrates asynchronously
// after the first navigation fires.
export default defineNuxtPlugin(() => {
  const { public: cfg } = useRuntimeConfig()
  if (!cfg.tourEnabled) return

  // Named useOnboardingTour, not useTour — Nuxt UI v4 ships its own useTour.
  const { start, hasSeen } = useOnboardingTour()
  const auth = useAuthStore()
  const route = useRoute()

  let fired = false
  const maybeStart = async () => {
    if (fired || hasSeen()) return
    if (route.path !== '/dashboard' || !auth.isAuthenticated) return
    fired = true
    await nextTick()
    // Wait for the nav (tour targets) to be in the DOM before measuring.
    requestAnimationFrame(() => start())
  }

  watch(() => [route.path, auth.isAuthenticated], maybeStart, { immediate: true })
})
