import posthog from 'posthog-js'

// Initializes PostHog in the browser when the analytics subsystem is enabled and
// a key is set. No-ops otherwise (zero-config template still runs). Client-only —
// PostHog is a browser SDK; server events aren't captured (add posthog-node if
// you need them). Exposes $posthog for useFeatureFlag() and manual capture.
export default defineNuxtPlugin(() => {
  const { posthog: cfg } = useRuntimeConfig().public

  if (!cfg.enabled || !cfg.key) {
    // Provide a null so consumers can guard without optional chaining everywhere.
    return { provide: { posthog: null as typeof posthog | null } }
  }

  posthog.init(cfg.key, {
    api_host: cfg.host,
    // We drive pageviews off vue-router below, so PostHog's own is off.
    capture_pageview: false,
    // Replay is opt-in (privacy + cost). PostHog only records when this is true.
    disable_session_recording: !cfg.sessionReplay,
    persistence: 'localStorage+cookie',
  })

  // Capture SPA navigations as pageviews.
  const router = useRouter()
  router.afterEach((to) => {
    posthog.capture('$pageview', { $current_url: to.fullPath })
  })

  return { provide: { posthog: posthog as typeof posthog | null } }
})
