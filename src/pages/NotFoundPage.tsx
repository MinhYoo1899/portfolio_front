import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.root}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
      <p className={styles.message}>
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>
      <Link to="/" className={styles.link}>
        목록으로 가기
      </Link>
    </div>
  )
}
