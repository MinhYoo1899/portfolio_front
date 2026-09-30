import { CATEGORIES } from '../features/categories/categories'
import styles from './CategoryFilter.module.css'

interface CategoryFilterProps {
  value?: string
  onChange: (id: string | undefined) => void
}

// Single-select category filter. Empty string in the <select> maps to
// `undefined` ("전체" / all categories). Options come from the fixed CATEGORIES
// constant (a T1 artifact); useCategories() returns the same list.
export default function CategoryFilter({
  value,
  onChange,
}: CategoryFilterProps) {
  return (
    <select
      className={styles.select}
      aria-label="카테고리 필터"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
    >
      <option value="">전체</option>
      {CATEGORIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
