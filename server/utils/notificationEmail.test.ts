import { describe, expect, it } from 'vitest'

import { renderNotificationEmail } from './notificationEmail'

describe('renderNotificationEmail', () => {
  it('renders a note_created email with escaped, embedded data', () => {
    const { subject, html } = renderNotificationEmail('note_created', {
      recipientName: 'Admin',
      actorName: 'Ana <script>',
      noteTitle: 'Q3 & plans',
      actionUrl: 'https://example.com/notes',
    })
    expect(subject).toBe('New note created')
    expect(html).toContain('Ana &lt;script&gt;') // escaped, not raw
    expect(html).toContain('Q3 &amp; plans')
    expect(html).toContain('https://example.com/notes')
  })
})
