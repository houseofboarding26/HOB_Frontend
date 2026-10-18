import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { logout as apiLogout, userFromToken, roleHome, fetchUserById, register as apiRegister, login as apiLogin, getTokenExpiry, isTokenExpired } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (email, password) => {
    setLoading(true)
    try {
      // POST /api/auth/login → { success, token, userId, role, message }
      const data = await apiLogin(email, password)
      const token = data?.token
      if (!token) throw new Error(data?.message || 'Invalid email or password')
      // Persist the session. loginWithToken fills name/email from the JWT
      // claims; the response gives us the authoritative id + role.
      const saved = loginWithToken(token, {
        id: data.userId,
        role: data.role || 'customer',
      })
      // Enrich with the real name/avatar from the backend (background).
      refreshUser(saved.id)
      return saved
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        'Invalid email or password'
      throw new Error(msg, { cause: err })
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      // Create the account in the backend (POST /api/users/add).
      const res = await apiRegister({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      // The backend response may wrap the user under `user` or return it flat,
      // and may (or may not) include a session token.
      const token = res?.token
      const created = res?.user || res || {}
      const profile = {
        id: created.id ?? created._id,
        name: created.name || data.name,
        email: created.email || data.email,
        role: created.role || data.role || 'customer',
      }
      // If the backend issued a token, start a real session; otherwise just
      // remember the created user so the UI reflects the new account.
      if (token) return loginWithToken(token, profile)
      setUser(profile)
      localStorage.setItem('user', JSON.stringify(profile))
      return profile
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Registration failed'
      throw new Error(msg, { cause: err })
    } finally {
      setLoading(false)
    }
  }

  const setRole = (role) => {
    if (user) {
      const updated = { ...user, role }
      setUser(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      localStorage.setItem('role', role)
    }
  }

  // "Become a Host" destination for the current visitor:
  //  • already logged in (token + user) → the standalone property setup form
  //    (no dashboard/sidebar). The role is NOT changed here — the user only
  //    becomes a host after they actually submit the form.
  //  • guest → the host signup form.
  const startBecomeHost = () => {
    if (!user || !localStorage.getItem('token')) return '/register/host'
    return '/become-host'
  }

  const loginWithToken = (token, userData = {}) => {
    // Fall back to the JWT's own claims for any field the caller didn't pass.
    // This guarantees we capture the user id (needed for `userId`) even when the
    // backend redirect omits the explicit ?id= param.
    const claims = (token && userFromToken(token)) || {}
    const id = userData.id ?? claims.id
    const userToSave = {
      ...userData,
      id,
      name: userData.name || claims.name,
      email: userData.email || claims.email,
      role: userData.role || claims.role || 'customer',
    }
    // Persist token, id and role individually so they can be read back
    // anywhere via localStorage, plus the full user object for the UI.
    if (token) localStorage.setItem('token', token)
    if (id != null) localStorage.setItem('userId', String(id))
    localStorage.setItem('role', userToSave.role)
    localStorage.setItem('user', JSON.stringify(userToSave))
    setUser(userToSave)
    return userToSave
  }

  // Wipe every trace of the session from state + localStorage.
  const clearSession = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
  }

  // Pull the full profile (name, avatar, …) from the backend and merge it into
  // the current user. This doubles as session validation: if the API rejects
  // the token (401/403) the session is invalid, so we log out — auth follows the
  // API, not a stale localStorage entry. Role is NOT overwritten on success —
  // it's owned by the login params / local upgrades (e.g. becoming a host).
  // Returns the fresh backend profile (incl. role) so callers can redirect by
  // role. Pass { syncRole: true } to also adopt the backend's role into the
  // session — used at login time, where the backend role is authoritative.
  // The reload path omits it so a local "become a host" upgrade isn't reverted.
  const refreshUser = async (id, { syncRole = false } = {}) => {
    const token = localStorage.getItem('token')
    if (!token) return null
    // The id inside the JWT is authoritative — trust it over a possibly stale
    // `user.id` in localStorage.
    const claims = userFromToken(token) || {}
    const uid = id || claims.id || user?.id || localStorage.getItem('userId')
    if (!uid) return null
    try {
      const fresh = await fetchUserById(uid)
      if (!fresh) { clearSession(); return null } // no such user → invalid session
      setUser((prev) => {
        // If the backend profile references the user's host listing, capture it
        // so the host dashboard / property form can load it without scanning.
        const freshHostId =
          fresh.hostId ?? fresh.host?.id ?? fresh.host?._id ?? fresh.hostProfileId ?? null
        const merged = {
          ...prev,
          id: fresh.id || prev?.id,
          name: fresh.name || prev?.name,
          email: fresh.email || prev?.email,
          avatar: fresh.avatar || prev?.avatar,
          hostId: freshHostId ?? prev?.hostId,
          ...(syncRole && fresh.role ? { role: fresh.role } : {}),
        }
        localStorage.setItem('user', JSON.stringify(merged))
        if (merged.id != null) localStorage.setItem('userId', String(merged.id))
        if (syncRole && fresh.role) localStorage.setItem('role', fresh.role)
        return merged
      })
      return fresh
    } catch (err) {
      const status = err?.response?.status
      // User deleted / token invalid or expired per the API → force logout.
      // A network error (no response) leaves the session untouched.
      if (status === 401 || status === 403 || status === 404) clearSession()
      return null
    }
  }

  // After Google login the backend returns the browser to our origin with
  // ?token=...&id=...&role=... . Catch those params on any page load, persist
  // the session, clean the URL, and redirect based on role:
  //   admin → admin panel, host → host panel, customer → website.
  // The /auth/callback route handles its own params, so skip it here.
  useEffect(() => {
    if (window.location.pathname === '/auth/callback') return
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    if (!token) return

    const claims = userFromToken(token) || {}
    const saved = loginWithToken(token, {
      id: url.searchParams.get('id') || claims.id,
      role: url.searchParams.get('role') || claims.role || 'customer',
      name: claims.name,
      email: claims.email,
    })

    ;['token', 'id', 'role', 'user'].forEach((k) => url.searchParams.delete(k))
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)

    // The JWT carries no role, so fetch the authoritative role (+ name/avatar)
    // from the backend, then redirect based on it: admin → admin panel,
    // host → host panel, customer → website.
    refreshUser(saved.id, { syncRole: true }).then((fresh) => {
      navigate(roleHome(fresh?.role || saved.role), { replace: true })
    })
  }, [])

  // Returning session (already logged in, no fresh token in the URL): re-fetch
  // the profile so the name/avatar stay correct even after a reload.
  useEffect(() => {
    const hasTokenParam = new URLSearchParams(window.location.search).get('token')
    if (hasTokenParam) return // fresh login handled above
    if (user?.id && localStorage.getItem('token')) refreshUser()
  }, [])

  // Force a full logout: wipe the session and send the user to /login so the
  // whole app resets to a fresh, logged-out state.
  const expireSession = () => {
    if (!localStorage.getItem('token') && !user) return
    clearSession()
    toast('Your session has expired. Please log in again.', { icon: '⏰' })
    navigate('/login', { replace: true })
  }

  // Auto-expire the session based on the JWT's `exp` claim. A single long
  // setTimeout is unreliable (browsers throttle background tabs and pause
  // timers while the machine sleeps), so we defend in depth:
  //   • check immediately on mount / user change,
  //   • schedule a timer for the exact expiry moment,
  //   • poll every 30s as a fallback, and
  //   • re-check whenever the tab regains focus / visibility.
  // The moment the token is expired we log out — a stale session never lingers.
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const checkExpiry = () => {
      const current = localStorage.getItem('token')
      if (!current || isTokenExpired(current)) {
        expireSession()
        return true
      }
      return false
    }

    if (checkExpiry()) return

    const exp = getTokenExpiry(token)
    // setTimeout maxes out at ~24.8 days; clamp so it fires reliably.
    const timer = exp
      ? setTimeout(checkExpiry, Math.min(Math.max(exp - Date.now(), 0), 2_147_483_647))
      : null
    const interval = setInterval(checkExpiry, 30_000)
    const onFocus = () => checkExpiry()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      if (timer) clearTimeout(timer)
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [user?.id])

  // The API layer dispatches `auth:expired` when the backend rejects the token
  // with a 401 (expired/invalid). Clearing localStorage there isn't enough —
  // the running UI still holds React state — so mirror it into a full logout.
  useEffect(() => {
    const onExpired = () => expireSession()
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const logout = () => {
    clearSession()
    // Best-effort backend session/cookie clear (e.g. Google logout).
    apiLogout()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, setRole, logout, loginWithToken, startBecomeHost, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
