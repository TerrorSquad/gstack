import type { NotificationType } from '#shared/types'

// Pure copy logic for transactional emails — no .vue imports, so it's unit-
// testable under the project's minimal vitest (pure logic only, no DOM).
// emails.ts pairs this with the Vue templates + render().

export interface NotificationData {
  recipientName: string | null
  actorName: string
  noteTitle: string
  actionUrl: string
}

export interface NotificationProps {
  heading: string
  intro: string
  noteTitle: string
  actionUrl: string
}

// Copy variants per notification type — data, not markup. One variant today;
// the map keeps room for more notification types.
const notificationVariants: Record<NotificationType, { subject: string; heading: string; intro: (d: NotificationData) => string }> = {
  note_created: {
    subject: 'New note created',
    heading: 'New note created',
    intro: (d) => `${d.actorName} created a note in your organisation.`,
  },
}

export function buildNotification(
  type: NotificationType,
  data: NotificationData,
): { subject: string; props: NotificationProps } {
  const v = notificationVariants[type]
  return {
    subject: v.subject,
    props: { heading: v.heading, intro: v.intro(data), noteTitle: data.noteTitle, actionUrl: data.actionUrl },
  }
}
