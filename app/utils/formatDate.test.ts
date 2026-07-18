import { describe, expect, it } from 'vitest'

import { formatDate, formatDateRange } from './formatDate'

// formatDate is the single mandated way to show dates (ADR-006), so its edge
// cases - nulls, zero-padding, malformed input - matter everywhere.
describe('formatDate', () => {
  it('formats an ISO date as Serbian dd.MM.yyyy. (trailing dot included)', () => {
    expect(formatDate('2026-07-13')).toBe('13.07.2026.')
  })

  it('keeps zero-padding on day and month', () => {
    expect(formatDate('2026-01-05')).toBe('05.01.2026.')
  })

  it('returns an em dash for null, undefined or empty', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('returns the input unchanged when it is not a 3-part date', () => {
    expect(formatDate('2026-07')).toBe('2026-07')
    expect(formatDate('garbage')).toBe('garbage')
  })
})

describe('formatDateRange', () => {
  it('joins two formatted dates with an en dash', () => {
    expect(formatDateRange('2026-07-01', '2026-07-10')).toBe('01.07.2026. – 10.07.2026.')
  })
})
