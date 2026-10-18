// Format any date value as "dd/mm/yyyy" for display.
//
// Accepts ISO strings ("2026-08-30T11:39:00.000Z"), plain "YYYY-MM-DD",
// Date objects, or timestamps. Plain "YYYY-MM-DD" is parsed as a local date to
// avoid a UTC day-shift. Returns '' for empty input and falls back to the raw
// value (or '—') when it can't be parsed.
export function formatDate(value) {
  if (!value) return ''

  let d
  if (typeof value === 'string') {
    const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    d = ymd
      ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
      : new Date(value)
  } else {
    d = new Date(value)
  }

  if (Number.isNaN(d.getTime())) return typeof value === 'string' ? value : '—'

  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
