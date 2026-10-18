import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Standalone host-onboarding guard. Requires a logged-in user (any role) and
// renders the property setup form on a plain page — deliberately NO dashboard
// Sidebar. The visitor only becomes a host once they submit the form, at which
// point they're moved into the real host area.
export default function HostSetupRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const from = location.pathname + location.search
    localStorage.setItem('postLoginRedirect', from)
    return <Navigate to="/login" state={{ from }} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <Outlet />
    </div>
  )
}
