// Thin Intl.NumberFormat wrappers. Pass your active i18n locale as `locales`
// (e.g. useI18n().locale.value) for locale-aware grouping/decimals.

export function formatNumber(
  input: number,
  fractionSize = 2,
  locales: string | string[] = 'en-US',
  signDisplay: Intl.NumberFormatOptions['signDisplay'] = 'auto',
): string {
  return new Intl.NumberFormat(locales, {
    signDisplay,
    minimumFractionDigits: fractionSize,
    maximumFractionDigits: fractionSize,
  }).format(input)
}

/** Like formatNumber but always shows the sign for non-zero values (+/-). */
export function formatSignedNumber(
  input: number,
  fractionSize = 2,
  locales: string | string[] = 'en-US',
): string {
  return formatNumber(input, fractionSize, locales, 'exceptZero')
}

export function formatPrice(
  input: number,
  currency = 'USD',
  locales: string | string[] = 'en-US',
): string {
  return new Intl.NumberFormat(locales, { style: 'currency', currency }).format(input)
}

/** Money as shown everywhere in the app: 2 decimals, the UI locale's grouping, optional currency code after. */
export function formatMoney(
  input: number | string | null | undefined,
  locale: string,
  currency?: string,
): string {
  const s = formatNumber(Number(input ?? 0), 2, locale)
  return currency ? `${s} ${currency}` : s
}

/** Relative change from `prev` to `cur` in percent, or null when there is nothing to compare with. */
export function percentChange(
  cur: number | string | null | undefined,
  prev: number | string | null | undefined,
): number | null {
  const c = Number(cur ?? 0)
  const p = Number(prev ?? 0)
  if (!p || !Number.isFinite(c) || !Number.isFinite(p)) return null
  return Math.round(((c - p) / Math.abs(p)) * 1000) / 10
}

/** The i18n locale code as Intl needs it: plain 'sr' is Serbian Cyrillic to Intl, the app writes Latin. */
export const intlLocale = (code: string) => (code === 'sr' ? 'sr-Latn' : code)
