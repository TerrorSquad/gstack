import { describe, expect, it } from 'vitest'

import { formatNumber, formatPrice, formatSignedNumber } from './formatNumber'

describe('formatNumber', () => {
  it('applies fixed fraction digits', () => {
    expect(formatNumber(1234.5, 2, 'en-US')).toBe('1,234.50')
  })
  it('signs only non-zero values with formatSignedNumber', () => {
    expect(formatSignedNumber(5, 0, 'en-US')).toBe('+5')
    expect(formatSignedNumber(-5, 0, 'en-US')).toBe('-5')
    expect(formatSignedNumber(0, 0, 'en-US')).toBe('0')
  })
  it('formats currency', () => {
    expect(formatPrice(9.9, 'USD', 'en-US')).toBe('$9.90')
  })
})
