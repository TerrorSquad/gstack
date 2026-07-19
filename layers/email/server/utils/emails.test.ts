import { describe, expect, it } from 'vitest'

import { buildNotification } from './emails.copy'

describe('buildNotification', () => {
  const data = {
    recipientName: 'Sam',
    actorName: 'Alex',
    noteTitle: 'Q3 planning',
    actionUrl: 'https://example.com/notes',
  }

  it('produces the subject and interpolates the actor into the intro', () => {
    const { subject, props } = buildNotification('note_created', data)
    expect(subject).toBe('New note created')
    expect(props.intro).toContain('Alex')
    expect(props.noteTitle).toBe('Q3 planning')
    expect(props.actionUrl).toBe('https://example.com/notes')
  })
})
