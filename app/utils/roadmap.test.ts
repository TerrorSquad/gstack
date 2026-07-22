import { describe, expect, it } from 'vitest'

import { ROADMAP_ITEMS, type RoadmapStatus } from './roadmap'

const STATUSES: RoadmapStatus[] = ['planned', 'in-progress', 'shipped']

describe('ROADMAP_ITEMS', () => {
  it('has items with valid statuses and non-empty titles', () => {
    expect(ROADMAP_ITEMS.length).toBeGreaterThan(0)
    for (const item of ROADMAP_ITEMS) {
      expect(STATUSES).toContain(item.status)
      expect(item.title.length).toBeGreaterThan(0)
    }
  })
})
