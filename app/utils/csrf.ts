// Attach the CSRF token only to same-origin, state-changing requests: GET/HEAD
// don't need it, and sending it cross-origin would leak the token (and trip CORS
// preflight on external APIs). Used by plugins/csrf.client.ts; pure so the
// boundary stays tested.
export function shouldAttachCsrf(method: string, url: string, origin: string): boolean {
  const m = method.toUpperCase()
  if (m === 'GET' || m === 'HEAD') return false
  if (/^https?:\/\//i.test(url) && !url.startsWith(origin)) return false
  return true
}
