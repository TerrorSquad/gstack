// Tunnels Sentry envelopes server-side so ad blockers / CORS can't block them.
// DSN is public-safe (see CLAUDE.md), so deriving host+projectId from it inline is fine.
import { defineEventHandler, readRawBody, sendWebResponse } from 'h3'

// Derive the envelope endpoint lazily — an empty/invalid DSN (Sentry not
// configured) must not throw at module load, or it takes the whole server bundle
// down with "Cannot access 'renderer' before initialization".
function envelopeUrl(): string | null {
  const raw = useRuntimeConfig().public.sentryDsn
  if (!raw) return null
  try {
    const dsn = new URL(raw)
    return `https://${dsn.host}/api${dsn.pathname}/envelope/`
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const sentryEnvelopeUrl = envelopeUrl()
  if (!sentryEnvelopeUrl) return { status: 'sentry_disabled' }

  // Public tunnel: lenient cap so a normal error burst still reports but a flood
  // from one IP can't be used to pump traffic through us.
  rateLimit(event, { limit: 120, windowMs: 60_000 })

  const rawBody = await readRawBody(event)
  if (!rawBody) return { status: 'empty_body' }

  try {
    const response = await fetch(sentryEnvelopeUrl, {
      method: 'POST',
      body: rawBody,
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
    })
    return sendWebResponse(event, response)
  } catch (error) {
    console.error('Sentry Tunnel Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to tunnel to Sentry',
    })
  }
})
