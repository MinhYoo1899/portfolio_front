import { useContext } from 'react'
import { AuthContext } from './authContextValue'
import type { AuthContextValue } from './authContextValue'

// Access the current user plus login/logout. Must be used within <AuthProvider>.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
