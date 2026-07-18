import { consola } from 'consola'

// Forward server-side consola logs to BetterStack Telemetry over HTTP.
// No-op unless both env vars are set, so dev and PR previews stay quiet.
// Logs are buffered per warm instance and flushed inside the request
// lifecycle (afterResponse) so Vercel's serverless freeze can't drop them.
// ponytail: fire-once-per-request batching; if volume gets high, swap to
// time/size-triggered flushing or @logtail/node.
export default defineNitroPlugin((nitroApp) => {
  const { betterstackSourceToken: token, betterstackIngestUrl: url } = useRuntimeConfig()
  if (!token || !url) return

  const buffer: Record<string, unknown>[] = []

  consola.addReporter({
    log(logObj) {
      buffer.push({
        dt: (logObj.date ?? new Date()).toISOString(),
        level: logObj.type,
        message: logObj.args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '),
        ...(logObj.tag ? { tag: logObj.tag } : {}),
      })
    },
  })

  async function flush() {
    if (buffer.length === 0) return
    const batch = buffer.splice(0)
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(batch),
      })
    } catch {
      // Dropping logs is acceptable - Sentry owns error reporting.
    }
  }

  nitroApp.hooks.hook('afterResponse', flush)
  nitroApp.hooks.hook('close', flush)
})
