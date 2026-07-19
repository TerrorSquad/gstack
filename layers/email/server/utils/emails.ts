import type { Component } from 'vue'

import { render } from '@vue-email/render'

import type { NotificationType } from '#shared/types'

import NotificationEmail from '../../emails/NotificationEmail'
import { buildNotification, type NotificationData, type NotificationProps } from './emails.copy'

// Registry of transactional emails. Each entry pairs a Vue template with sample
// props for the /dev/emails preview route. Copy logic lives in emails.copy.ts
// (pure, unit-tested); this module owns the templates + render().
//
// Adding an email = a new .vue template + a new registry entry + a builder in
// emails.copy.ts. Senders call renderNotificationEmail(type, data) (or a sibling).

export interface EmailPreview {
  id: string
  label: string
  component: Component
  sampleProps: Record<string, unknown>
}

export const emailRegistry: EmailPreview[] = [
  {
    id: 'notification',
    label: 'Notification',
    component: NotificationEmail,
    sampleProps: {
      heading: 'New note created',
      intro: 'Alex created a note in your organisation.',
      noteTitle: 'Q3 planning',
      actionUrl: 'https://example.com/notes',
    } satisfies NotificationProps,
  },
]

/** Render the notification email to { subject, html }. */
export async function renderNotificationEmail(
  type: NotificationType,
  data: NotificationData,
): Promise<{ subject: string; html: string }> {
  const { subject, props } = buildNotification(type, data)
  const html = await render(NotificationEmail, props)
  return { subject, html }
}

/** Render any registry template by id from arbitrary props (used by /dev/emails). */
export async function renderPreview(id: string, props: Record<string, unknown>): Promise<string> {
  const entry = emailRegistry.find((e) => e.id === id)
  if (!entry) throw new Error(`unknown email: ${id}`)
  return render(entry.component, props)
}
