import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import styles from './RouteError.module.css'

function resolveMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function RouteError() {
  const error = useRouteError()

  return (
    <div className={styles.root} role="alert">
      <h1 className={styles.title}>문제가 발생했습니다</h1>
      <p className={styles.message}>{resolveMessage(error)}</p>
      <Link to="/" className={styles.link}>
        목록으로 돌아가기
      </Link>
    </div>
  )
}
