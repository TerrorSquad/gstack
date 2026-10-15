import { describe, expect, it } from 'vitest'

import { formatDate, formatDateRange, formatDateTime, parseDateInput } from './formatDate'

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

describe('formatDateTime', () => {
  it('formats a timestamp as dd.MM.yyyy. HH:mm in local time', () => {
    const d = new Date(2026, 9, 14, 9, 5)
    expect(formatDateTime(d.toISOString())).toBe('14.10.2026. 09:05')
  })
  it('em dash for nothing', () => {
    expect(formatDateTime(null)).toBe('—')
  })
})

describe('parseDateInput', () => {
  const y = new Date().getFullYear()
  it('reads Serbian, ISO and compact forms', () => {
    expect(parseDateInput('14.10.2026.')).toBe('2026-10-14')
    expect(parseDateInput('4.1.2026')).toBe('2026-01-04')
    expect(parseDateInput('2026-10-14')).toBe('2026-10-14')
    expect(parseDateInput('14102026')).toBe('2026-10-14')
    expect(parseDateInput('14.10.')).toBe(`${y}-10-14`)
    expect(parseDateInput('14/10/2026')).toBe('2026-10-14')
  })
  it('refuses impossible dates and noise', () => {
    expect(parseDateInput('31.02.2026')).toBeNull()
    expect(parseDateInput('abc')).toBeNull()
    expect(parseDateInput('')).toBeNull()
  })
})
