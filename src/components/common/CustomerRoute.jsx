import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Guard for customer-facing protected pages (booking, profile, pet profile…).
// Unlike ProtectedRoute, it does NOT render the dashboard Sidebar — these pages
// live inside the public Layout (Navbar + Footer). If the user isn't logged in
// we send them to /login and remember where they came from so they land back
// on the exact page after signing in.
export default function CustomerRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const from = location.pathname + location.search
    localStorage.setItem('postLoginRedirect', from)
    return <Navigate to="/login" state={{ from }} replace />
  }

  if (user.role === 'host') return <Navigate to="/host/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />

  return <Outlet />
}
