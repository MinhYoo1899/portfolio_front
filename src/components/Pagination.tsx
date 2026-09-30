import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  total: number
  size: number
  onChange: (page: number) => void
}

export default function Pagination({
  page,
  total,
  size,
  onChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / size))
  // Clamp the active page into range so an out-of-range URL still highlights a
  // valid button.
  const current = Math.min(Math.max(1, page), pageCount)

  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <nav className={styles.nav} aria-label="페이지네이션">
      <button
        type="button"
        className={styles.arrow}
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        aria-label="이전 페이지"
      >
        이전
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={
            p === current ? `${styles.page} ${styles.active}` : styles.page
          }
          aria-current={p === current ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className={styles.arrow}
        disabled={current >= pageCount}
        onClick={() => onChange(current + 1)}
        aria-label="다음 페이지"
      >
        다음
      </button>
    </nav>
  )
}
