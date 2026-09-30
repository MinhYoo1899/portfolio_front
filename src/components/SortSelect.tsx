import styles from './SortSelect.module.css'

type Sort = 'latest' | 'views'

interface SortSelectProps {
  value: Sort
  onChange: (v: Sort) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      className={styles.select}
      aria-label="정렬"
      value={value}
      onChange={(e) => onChange(e.target.value as Sort)}
    >
      <option value="latest">최신순</option>
      <option value="views">조회순</option>
    </select>
  )
}
