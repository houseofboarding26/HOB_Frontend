import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../Sidebar'

const ROLE_DASHBOARD = {
  customer: '/',
  host: '/host/dashboard',
  admin: '/admin/dashboard',
}

export default function ProtectedRoute({ roles }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD[user.role] || '/'} replace />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
