import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  environment: import.meta.dev ? 'development' : 'production',
  tracesSampleRate: 0.1,
  enabled: !import.meta.dev,
  debug: import.meta.dev,
  // Default 10KB truncates larger error envelopes before they're captured.
  integrations: [Sentry.httpIntegration({ maxIncomingRequestBodySize: 'always' })],
  enableLogs: true,
})
