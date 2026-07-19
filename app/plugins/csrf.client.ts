// Echo the CSRF token (nuxt-csurf) on every same-origin mutating request, so
// existing $fetch / useFetch call sites need no changes. nuxt-csurf renders the
// token into a <meta name="csrf-token"> during SSR (useCsrf reads it) and keeps
// the signing secret in an httpOnly cookie the server middleware validates.
//
// Client-only on purpose: globalThis.$fetch is per-user in the browser but shared
// across requests on the server — never reassign it there.
// shouldAttachCsrf (same-origin + mutating-method gate) lives in ~/utils/csrf.
export default defineNuxtPlugin(() => {
  const { csrf, headerName } = useCsrf()
  if (!csrf || !headerName) return

  const base = globalThis.$fetch
  globalThis.$fetch = base.create({
    onRequest({ request, options }) {
      const url = typeof request === 'string' ? request : request.url
      if (!shouldAttachCsrf(options.method ?? 'GET', url, window.location.origin)) return
      const headers = new Headers(options.headers)
      headers.set(headerName, csrf)
      options.headers = headers
    },
  }) as typeof base
})
