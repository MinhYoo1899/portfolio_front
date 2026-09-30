// Format an ISO timestamp as a readable local date (YYYY. M. D.). Falls back to
// the raw string if it can't be parsed.
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
