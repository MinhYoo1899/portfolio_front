import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import { MOCK_USERS } from './mockUsers'
import styles from './LoginPage.module.css'

// Only allow same-origin relative redirects: must start with a single slash,
// not '//' (protocol-relative) and not '/\' (backslash, which some browsers
// normalize to a slash and would enable an open redirect). Otherwise '/'.
function safeRedirect(raw: string | null): string {
  if (!raw) return '/'
  if (/^\/(?![/\\])/.test(raw)) return raw
  return '/'
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState<string>(MOCK_USERS[0].name)

  const redirect = safeRedirect(searchParams.get('redirect'))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login(name)
    navigate(redirect, { replace: true })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>로그인</h1>
      <p className={styles.hint}>
        데모 사용자를 선택하거나 이름을 입력해 로그인하세요.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="login-name">
          사용자
        </label>
        <select
          id="login-name"
          className={styles.select}
          value={MOCK_USERS.some((u) => u.name === name) ? name : ''}
          onChange={(e) => setName(e.target.value)}
        >
          {MOCK_USERS.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name} ({u.role})
            </option>
          ))}
          <option value="">직접 입력…</option>
        </select>

        <label className={styles.label} htmlFor="login-name-input">
          이름
        </label>
        <input
          id="login-name-input"
          className={styles.input}
          type="text"
          value={name}
          placeholder="이름 입력"
          onChange={(e) => setName(e.target.value)}
        />

        <button className={styles.button} type="submit">
          로그인
        </button>
      </form>
    </div>
  )
}
