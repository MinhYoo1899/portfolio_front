import type { FormEvent } from 'react'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
}: SearchBarProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit?.()
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        className={styles.input}
        placeholder="제목, 본문, 작성자 검색"
        aria-label="검색"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="submit" className={styles.button}>
        검색
      </button>
    </form>
  )
}
