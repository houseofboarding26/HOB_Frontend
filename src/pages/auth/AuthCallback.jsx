import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userFromToken, roleHome } from '../../services/authService'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const { loginWithToken, refreshUser } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    // Backend may redirect back with an error (e.g. access denied).
    const oauthError = params.get('error')
    if (oauthError) {
      setError(decodeURIComponent(oauthError) || 'Google sign-in failed. Please try again.')
      return
    }

    const token = params.get('token')

    if (token) {
      // Backend sends id & role as explicit params; fall back to JWT claims.
      const claims = userFromToken(token) || {}
      const saved = loginWithToken(token, {
        id: params.get('id') || claims.id,
        role: params.get('role') || claims.role || 'customer',
        name: claims.name,
        email: claims.email,
      })
      const redirect = localStorage.getItem('postLoginRedirect')
      localStorage.removeItem('postLoginRedirect')
      // The JWT carries no role — fetch the authoritative role (+ name/avatar)
      // from the backend, then redirect by role: admin → admin panel,
      // host → host dashboard, customer → website home.
      refreshUser(saved.id, { syncRole: true }).then((fresh) => {
        navigate(redirect || roleHome(fresh?.role || saved.role), { replace: true })
      })
    } else {
      setError('No token received. Please try logging in again.')
    }
  }, [])

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-600 font-semibold">{error}</p>
      <button onClick={() => navigate('/login')} className="text-secondary underline text-sm">
        Back to Login
      </button>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <span className="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Signing you in…</p>
    </div>
  )
}
