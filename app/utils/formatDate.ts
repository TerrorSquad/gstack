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

/** A timestamp as dd.MM.yyyy. HH:mm in the viewer's time zone — the companion of formatDate. */
export function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}. ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** What a person types into a date field → ISO date, or null. Accepts 14.10.2026(.), 14/10/2026, 2026-10-14,
 *  14102026 and 14.10. (this year). Impossible dates (31.02.) are refused. */
export function parseDateInput(raw: string): string | null {
  const s = raw.trim()
  let d: number, m: number, y: number
  let r: RegExpMatchArray | null
  if ((r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)))
    [y, m, d] = [Number(r[1]), Number(r[2]), Number(r[3])]
  else if ((r = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})\.?$/)))
    [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])]
  else if ((r = s.match(/^(\d{1,2})[./](\d{1,2})\.?$/)))
    [d, m, y] = [Number(r[1]), Number(r[2]), new Date().getFullYear()]
  else if ((r = s.match(/^(\d{2})(\d{2})(\d{4})$/)))
    [d, m, y] = [Number(r[1]), Number(r[2]), Number(r[3])]
  else return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return dt.toISOString().slice(0, 10)
}

/** Today as YYYY-MM-DD in the user's own time zone (toISOString would give yesterday between midnight and 2 a.m. in Serbia). */
export const todayIso = () => new Date().toLocaleDateString('sv-SE')
