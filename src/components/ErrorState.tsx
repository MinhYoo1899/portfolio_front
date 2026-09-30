import styles from './ErrorState.module.css'

interface ErrorStateProps {
  error?: unknown
  message?: string
  onRetry?: () => void
}

function resolveMessage(error: unknown, message?: string): string {
  if (message) return message
  if (error instanceof Error && error.message) return error.message
  return '문제가 발생했습니다.'
}

export default function ErrorState({
  error,
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.root} role="alert">
      <p className={styles.message}>{resolveMessage(error, message)}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}
