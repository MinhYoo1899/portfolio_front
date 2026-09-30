import styles from './EmptyState.module.css'

interface EmptyStateProps {
  message?: string
}

export default function EmptyState({
  message = '표시할 항목이 없습니다.',
}: EmptyStateProps) {
  return (
    <div className={styles.root} role="status">
      <p className={styles.message}>{message}</p>
    </div>
  )
}
