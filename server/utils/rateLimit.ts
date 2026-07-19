import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { H3Event } from 'h3'

// Rate limiter for unauthenticated/public routes. Uses Upstash Redis when
// UPSTASH_REDIS_REST_URL/_TOKEN are set (limits hold across serverless
// instances); otherwise falls back to an in-memory fixed window (per warm
// instance, resets on cold start) so the zero-config template still runs.
// See docs/adr/0003-upstash-redis.md.

type Decision = { ok: true } | { ok: false; retryAfter: number }

const windows = new Map<string, { count: number; resetAt: number }>()

// Pure in-memory core, unit-tested without an H3 event.
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

// Lazily create the Redis client (null when unconfigured) and memoize a
// Ratelimit per (limit, window) — Ratelimit bakes in a fixed limiter.
let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis === undefined) {
    redis =
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null
  }
  return redis
}

const limiters = new Map<string, Ratelimit>()
function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis()!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: 'rl',
    })
    limiters.set(cacheKey, limiter)
  }
  return limiter
}

// Throws a 429 (with Retry-After) once an IP exceeds `limit` requests per
// `windowMs` on this route. Call at the top of a public event handler.
export async function rateLimit(
  event: H3Event,
  opts: { limit: number; windowMs: number },
): Promise<void> {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${event.path}:${ip}`

  if (getRedis()) {
    const { success, reset } = await getLimiter(opts.limit, opts.windowMs).limit(key)
    if (!success) {
      setResponseHeader(event, 'Retry-After', Math.ceil((reset - Date.now()) / 1000))
      throw createError({ statusCode: 429, message: 'Too many requests' })
    }
    return
  }

  const decision = hit(key, opts)
  if (!decision.ok) {
    setResponseHeader(event, 'Retry-After', decision.retryAfter)
    throw createError({ statusCode: 429, message: 'Too many requests' })
  }
}
