import type { Database } from '#shared/types/database.types'
import type { NotificationType } from '#shared/types'

import { serverSupabaseServiceRole } from '#supabase/server'


// Called by a Supabase DB webhook on every notifications INSERT. Mirrors the
// in-app notification to a transactional email via Resend. Configure the webhook
// in the Supabase dashboard (Database → Webhooks) to POST here with an
// `x-webhook-secret` header matching NUXT_NOTIFICATION_WEBHOOK_SECRET.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.public.notificationsEnabled) return { ok: true, skipped: 'notifications-disabled' }

  const secret = getRequestHeader(event, 'x-webhook-secret')
  if (!config.notificationWebhookSecret || secret !== config.notificationWebhookSecret) {
    throw createError({ statusCode: 401, message: 'unauthorized' })
  }

  const body = await readBody<{
    record?: { recipient_id: string; actor_id: string | null; type: NotificationType; note_id: string | null }
  }>(event)
  const rec = body?.record
  if (!rec) throw createError({ statusCode: 400, message: 'no record' })

  if (!useRuntimeConfig(event).supabase.secretKey)
    throw createError({ statusCode: 500, message: 'NUXT_SUPABASE_SECRET_KEY not set' })
  const db = serverSupabaseServiceRole<Database>(event)

  const [{ data: recipient }, { data: actor }, { data: note }] = await Promise.all([
    db.from('profiles').select('email, full_name').eq('id', rec.recipient_id).single(),
    rec.actor_id
      ? db.from('profiles').select('full_name').eq('id', rec.actor_id).single()
      : Promise.resolve({ data: null }),
    rec.note_id
      ? db.from('notes').select('title').eq('id', rec.note_id).single()
      : Promise.resolve({ data: null }),
  ])

  if (!recipient?.email) throw createError({ statusCode: 404, message: 'missing recipient' })

  const origin = config.siteUrl || getRequestURL(event).origin
  const { subject, html } = await renderNotificationEmail(rec.type, {
    recipientName: recipient.full_name,
    actorName: actor?.full_name ?? 'A teammate',
    noteTitle: note?.title ?? '',
    actionUrl: `${origin}/notes`,
  })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.resendKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Starter <no-reply@example.com>', // must be a Resend-verified domain
      to: recipient.email,
      subject,
      html,
    }),
  })

  if (!res.ok) throw createError({ statusCode: 502, message: await res.text() })
  return { ok: true }
})
