// Generic, domain-agnostic client-side filter -> sort -> page-slice utility.
// Returns the standard REST list envelope so callers can swap in HTTP later.

export interface PaginateOptions<T> {
  predicate?: (x: T) => boolean
  comparator?: (a: T, b: T) => number
  page: number
  size: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export function filterSortPaginate<T>(
  items: T[],
  opts: PaginateOptions<T>,
): PaginatedResult<T> {
  const { predicate, comparator, page, size } = opts

  const filtered = predicate ? items.filter(predicate) : items.slice()
  const sorted = comparator ? filtered.sort(comparator) : filtered

  const total = sorted.length
  const start = (page - 1) * size
  const pageItems = sorted.slice(start, start + size)

  return { items: pageItems, total, page, size }
}
