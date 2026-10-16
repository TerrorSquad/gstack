import * as Sentry from '@sentry/nuxt'

import { scrubSentryEvent } from './app/utils/scrubSentryEvent'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  environment: import.meta.dev ? 'development' : 'production',
  tracesSampleRate: 0.1,
  enabled: !import.meta.dev,
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
