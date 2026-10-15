import type { ErrorEvent } from '@sentry/nuxt'

// Strip request bodies and credentials from Sentry events before they leave the process. Bodies carry customer data,
// emails and passwords; Sentry's default scrubbing doesn't remove a whole JSON body. Shared by the client and server
// config, behind `dataCollection` (which already asks for none of it) in case an integration attaches it anyway.
export function scrubSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
    delete event.request.query_string
    const h = event.request.headers
    if (h)
      for (const k of Object.keys(h))
        if (/^(authorization|cookie|apikey|x-api-key)$/i.test(k)) delete h[k]
  }
  return event
}
