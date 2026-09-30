import { createContext } from 'react'
import type { User } from './types'

// Shared auth context value. Kept in its own (component-free) module so that
// AuthContext.tsx exports only the AuthProvider component, satisfying
// react-refresh/only-export-components, while useAuth.ts can import the context.
export interface AuthContextValue {
  user: User | null
  login: (name: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
