import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

// Route guard for protected routes. When no user is logged in, redirect to
// /login carrying the current path+search as a (same-origin) redirect target
// so the user returns here after authenticating (AC15).
export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
