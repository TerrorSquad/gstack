import { describe, expect, it } from 'vitest'

import { buildNotification } from './emails.copy'

describe('buildNotification', () => {
  it('builds copy for note_created', () => {
    const { subject, props } = buildNotification('note_created', {
      recipientName: 'Ada',
      actorName: 'Milo',
      noteTitle: 'Q3 plan',
      actionUrl: 'https://app/notes/1',
    })
    expect(subject).toBe('New note created')
    expect(props.heading).toBe('New note created')
    expect(props.intro).toContain('Milo')
    expect(props.noteTitle).toBe('Q3 plan')
    expect(props.actionUrl).toBe('https://app/notes/1')
  })
})
