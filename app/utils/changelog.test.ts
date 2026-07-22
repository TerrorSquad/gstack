import { describe, expect, it } from 'vitest'

import { CHANGELOG_ENTRIES } from './changelog'

describe('CHANGELOG_ENTRIES', () => {
  it('is non-empty with ISO dates and valid highlights', () => {
    expect(CHANGELOG_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of CHANGELOG_ENTRIES) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.highlights.length).toBeGreaterThan(0)
      for (const h of entry.highlights) {
        expect(['feature', 'fix']).toContain(h.kind)
        expect(h.text.length).toBeGreaterThan(0)
      }
    }
  })

  it('is ordered newest-first', () => {
    const dates = CHANGELOG_ENTRIES.map((e) => e.date)
    expect(dates).toEqual([...dates].toSorted().toReversed())
  })
})
