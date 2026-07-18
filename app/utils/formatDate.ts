/** Formats ISO date string (YYYY-MM-DD) as Serbian dd.MM.yyyy. format */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${d}.${m}.${y}.`
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} – ${formatDate(end)}`
}
