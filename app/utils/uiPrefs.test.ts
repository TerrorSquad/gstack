import { describe, expect, it } from 'vitest'

import { DEFAULT_UI_PREFS, normalizePrefs } from './uiPrefs'

describe('normalizePrefs', () => {
  it('fills defaults for an empty profile', () => {
    expect(normalizePrefs({})).toEqual(DEFAULT_UI_PREFS)
    expect(normalizePrefs(null)).toEqual(DEFAULT_UI_PREFS)
  })
  it('keeps valid values and drops broken ones', () => {
    expect(
      normalizePrefs({
        locale: 'sr',
        theme: 'dark',
        accent: 'teal',
        font: 'comic',
        textSize: '125',
        motion: 'reduce',
        contrast: 'loud',
        staySignedIn: 'yes',
      }),
    ).toEqual({
      ...DEFAULT_UI_PREFS,
      locale: 'sr',
      theme: 'dark',
      accent: 'teal',
      textSize: 125,
      motion: 'reduce',
    })
  })
})
