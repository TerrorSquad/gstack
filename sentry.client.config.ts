import * as Sentry from '@sentry/nuxt'

import { scrubSentryEvent } from './app/utils/scrubSentryEvent'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  // Routes events through server/api/sentry.post.ts so ad blockers / CORS can't block them.
  tunnel: '/api/sentry',
  enabled: !import.meta.dev,
  environment: import.meta.dev ? 'development' : 'production',
  tracesSampleRate: 0.1,
  // Sentry 11 collects IPs, cookies, query strings and bodies unless told otherwise.
  dataCollection: {
    userInfo: false,
    cookies: false,
    urlQueryParams: false,
    httpBodies: [],
    stackFrameVariables: false,
  },
  beforeSend: scrubSentryEvent,
})
