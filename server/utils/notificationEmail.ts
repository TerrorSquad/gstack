export type NotificationType = 'note_created'

export interface EmailData {
  recipientName: string
  actorName: string
  noteTitle: string
  actionUrl: string
}

// Email clients strip <style>/flexbox — inline styles + tables only.
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function renderNotificationEmail(type: NotificationType, data: EmailData) {
  // Single variant today; the map keeps room for more notification types.
  const variants: Record<NotificationType, { subject: string; heading: string; intro: string }> = {
    note_created: {
      subject: 'New note created',
      heading: 'New note created',
      intro: `${data.actorName} created a note in your organisation.`,
    },
  }
  const v = variants[type]

  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
<tr><td style="padding:24px 32px;text-align:center;"><span style="color:#059669;font-weight:700;font-size:18px;">Starter</span></td></tr>
<tr><td style="padding:0 32px;text-align:center;">
  <h1 style="margin:16px 0 8px;font-size:20px;color:#111827;">${esc(v.heading)}</h1>
  <p style="margin:0 0 16px;color:#374151;font-size:14px;">${esc(v.intro)}</p>
  <p style="margin:0 0 8px;padding:12px 16px;background:#f3f4f6;border-radius:8px;color:#111827;font-size:14px;font-weight:600;">${esc(data.noteTitle)}</p>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="${esc(data.actionUrl)}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">View</a>
</td></tr>
</table></td></tr></table></body></html>`

  return { subject: v.subject, html }
}
