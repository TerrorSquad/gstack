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
