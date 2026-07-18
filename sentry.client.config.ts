import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  // Routes events through server/api/sentry.post.ts so ad blockers / CORS can't block them.
  tunnel: '/api/sentry',
  enabled: !import.meta.dev,
  environment: import.meta.dev ? 'development' : 'production',
  tracesSampleRate: 0.1,
  debug: import.meta.dev,
  enableLogs: true,
})
