import * as Sentry from '@sentry/nuxt'

// @sentry/nuxt reports unhandled crashes but skips createError-shaped errors
// (they're "handled" application responses). We still want intentional 5xx
// (e.g. the missing-key guards, DB failures) visible. Nitro's `error` hook
// fires for every request error; forward only 5xx so 4xx client errors
// (401/403/400 validation) don't become Sentry noise.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500
    if (status < 500) return
    Sentry.captureException(error, {
      extra: { url: event?.path, statusCode: status },
    })
  })
})
