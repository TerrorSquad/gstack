import { describe, expect, it } from 'vitest'

import {
  formatMoney,
  formatNumber,
  formatPrice,
  formatSignedNumber,
  percentChange,
} from './formatNumber'

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

describe('formatMoney', () => {
  it('two decimals with locale grouping, optional currency code', () => {
    expect(formatMoney(5596, 'sr')).toBe('5.596,00')
    expect(formatMoney('1234.5', 'en', 'RSD')).toBe('1,234.50 RSD')
    expect(formatMoney(null, 'en')).toBe('0.00')
  })
})

describe('percentChange', () => {
  it('is relative to the previous value, one decimal', () => {
    expect(percentChange(110, 100)).toBe(10)
    expect(percentChange('50', '200')).toBe(-75)
    expect(percentChange(-50, -100)).toBe(50) // a smaller loss is an improvement
  })
  it('is null without a basis', () => {
    expect(percentChange(10, 0)).toBeNull()
    expect(percentChange(10, null)).toBeNull()
  })
})
