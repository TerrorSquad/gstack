# ADR-0003: Upstash Redis for distributed rate limiting + cache

**Status:** Accepted (implemented — `server/utils/rateLimit.ts`) · **Date:** 2026-07-19

## Context

The current rate limiter (`server/utils/rateLimit.ts`) is an in-memory
fixed-window counter. Its own comment names the ceiling: **state is per warm
serverless instance and resets on cold start**, so on Vercel a caller is limited
per-instance, not globally. That's fine as a brake against casual abuse but
inadequate for anything security-sensitive (login/OTP/webhook abuse) once traffic
spreads across instances.

Upstash Redis is serverless (HTTP-based, no connection pooling), which fits
Vercel/Nitro edge-and-serverless runtimes where a normal Redis TCP client is a
poor fit. `@upstash/ratelimit` provides sliding-window/token-bucket limits backed
by Redis.

## Decision

Adopt **Upstash Redis** as the optional durable KV layer, used for:

1. **Distributed rate limiting** — `@upstash/ratelimit` + `@upstash/redis`,
   replacing the in-memory limiter on the public/auth routes. **Env-gated with
   in-memory fallback**: if `UPSTASH_REDIS_REST_URL`/`_TOKEN` are unset, fall back
   to the existing in-memory limiter, so local dev and the template's zero-config
   path keep working.
2. **KV cache** (later) — memoize expensive server reads with a TTL.

Keep the abstraction thin: one `rateLimit(event, opts)` entrypoint whose backend
is Upstash when configured, in-memory otherwise.

## Consequences

- Rate limits hold across serverless instances when configured.
- One new (optional) dependency + two env vars; no-op without them.
- Not on the hot path unless a route opts in.
- Pricing: Upstash has a free tier (per-request billing) sufficient for the
  template's defaults ([upstash.com/pricing/redis](https://upstash.com/pricing/redis)).

## Alternatives considered

- **Vercel KV** — also Upstash under the hood, but ties the template to Vercel;
  Upstash direct keeps deployment portable.
- **Postgres-based limiter** — avoids a dependency but adds write load to the
  primary DB and is slower; rejected.
