import type { H3Event } from 'h3'

// Tiny in-memory fixed-window rate limiter for the unauthenticated public
// routes (check-email, check-pib, klaviyo-subscribe, sentry). State lives on the
// warm serverless instance, so limits are per-instance and reset on cold start —
// enough of a brake against enumeration/abuse, not a billing-grade global quota.
// ponytail: per-instance counters; move to Upstash/Redis if a limit that holds
// across Vercel instances ever matters.

type Decision = { ok: true } | { ok: false; retryAfter: number }

const windows = new Map<string, { count: number; resetAt: number }>()

// Pure core: record one hit against `key` and decide if it's over the limit.
// Exposed (and unit-tested) separately from the event plumbing so the counting
// logic can be checked without an H3 event.
export function hit(
  key: string,
  opts: { limit: number; windowMs: number },
  now: number = Date.now(),
): Decision {
  // Opportunistic sweep so the map can't grow unbounded over an instance's life.
  if (windows.size > 10_000) {
    for (const [k, v] of windows) if (now >= v.resetAt) windows.delete(k)
  }

  const w = windows.get(key)
  if (!w || now >= w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true }
  }

  w.count++
  if (w.count > opts.limit) return { ok: false, retryAfter: Math.ceil((w.resetAt - now) / 1000) }
  return { ok: true }
}

// Throws a 429 (with Retry-After) once an IP exceeds `limit` requests per
// `windowMs` on this route. Call at the top of a public event handler.
export function rateLimit(event: H3Event, opts: { limit: number; windowMs: number }): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const decision = hit(`${event.path}:${ip}`, opts)
  if (!decision.ok) {
    setResponseHeader(event, 'Retry-After', decision.retryAfter)
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }
}
