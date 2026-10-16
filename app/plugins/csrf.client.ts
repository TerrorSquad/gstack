// Echo the CSRF token (nuxt-csurf) on every same-origin mutating request, so
// existing $fetch / useFetch call sites need no changes. nuxt-csurf renders the
// token into a <meta name="csrf-token"> during SSR (useCsrf reads it) and keeps
// the signing secret in an httpOnly cookie the server middleware validates.
//
// It wraps window.fetch, not $fetch: Nuxt 4.6 hands components a $fetch bound at
// module load, so replacing globalThis.$fetch no longer reached them (every POST
// to our API failed with "CSRF Token not found"). ofetch calls fetch per request.
// Client-only on purpose. shouldAttachCsrf (same-origin + mutating-method gate)
// lives in ~/utils/csrf.
export default defineNuxtPlugin(() => {
  const { csrf, headerName } = useCsrf()
  if (!csrf || !headerName) return

  const base = window.fetch.bind(window)
  window.fetch = (input, init) => {
    const req = input instanceof Request ? input : undefined
    const url = req ? req.url : String(input)
    if (!shouldAttachCsrf(init?.method ?? req?.method ?? 'GET', url, window.location.origin))
      return base(input, init)
    const headers = new Headers(init?.headers ?? req?.headers)
    headers.set(headerName, csrf)
    return base(input, { ...init, headers })
  }
})
