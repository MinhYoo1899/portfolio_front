import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import styles from './Header.module.css'

// Top navigation: home + write links on the left, the current user (with role)
// and logout on the right, or a login link when signed out (AC16).
export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="주 메뉴">
        <Link to="/" className={styles.brand}>
          게시판
        </Link>
        <Link to="/posts/new" className={styles.link}>
          글쓰기
        </Link>
      </nav>

      <div className={styles.user}>
        {user ? (
          <>
            <span className={styles.userName}>
              {user.name} ({user.role})
            </span>
            <button
              type="button"
              className={styles.logout}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
