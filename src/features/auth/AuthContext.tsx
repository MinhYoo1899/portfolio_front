import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readJSON, writeJSON } from '../../lib/storage'
import { newId } from '../../lib/id'
import { MOCK_USERS } from './mockUsers'
import type { User } from './types'
import { AuthContext } from './authContextValue'

const AUTH_KEY = 'auth'

// Provides the current mock user and login/logout actions, persisted to
// localStorage (key 'board-app:auth') via the lib/storage helpers so the
// session survives a page refresh (AC14).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    readJSON<User | null>(AUTH_KEY, null),
  )

  // Match a mock user by name; otherwise create a regular user with that name.
  // An empty/blank name falls back to the first mock user.
  const login = useCallback((name: string) => {
    const trimmed = name.trim()
    let next: User
    if (!trimmed) {
      next = MOCK_USERS[0]
    } else {
      const matched = MOCK_USERS.find((u) => u.name === trimmed)
      next = matched ?? { id: newId(), name: trimmed, role: 'user' }
    }
    setUser(next)
    writeJSON<User | null>(AUTH_KEY, next)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    writeJSON<User | null>(AUTH_KEY, null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
