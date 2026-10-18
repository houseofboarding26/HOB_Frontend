import api from './api'

// Origin that hosts the backend OAuth endpoints. Defaults to the deployed
// beta API; override with VITE_API_ORIGIN for other environments.
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://hob-beta.vercel.app').replace(/\/+$/, '')

// Full URL the browser navigates to in order to start the Google OAuth flow.
// We pass the current frontend origin as `redirectUrl` so the backend knows
// where to send the user back to (works on localhost and deployed alike).
// The backend appends /auth/callback?token=...&user=... to this origin.
export const googleLoginUrl = () => {
  // redirectUrl is ALWAYS the current frontend origin — dynamic, never
  // hardcoded. It resolves automatically per environment:
  //   localhost:5173 → http://localhost:5173
  //   localhost:3000 → http://localhost:3000
  //   deployed       → https://your-domain.com
  // Sent as a raw (un-encoded) query param; the backend expects the plain origin.
  const redirectUrl = window.location.origin
  return `${API_ORIGIN}/api/auth/google?redirectUrl=${redirectUrl}`
}

// Kick off Google sign-in via a top-level browser navigation.
export const startGoogleLogin = () => {
  window.location.href = googleLoginUrl()
}

// Landing route for a given role after login.
// admin → admin panel, host → host panel, customer (or anything else) → website.
export const roleHome = (role) =>
  role === 'admin' ? '/admin/dashboard' :
  role === 'host'  ? '/host/dashboard' :
  '/'

// Decode a JWT payload (base64url) without verifying the signature — just to
// read the user claims (id, email, name, role, ...) the backend embedded.
export const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Token expiry (from the JWT `exp` claim), in ms since epoch — or null if the
// token has no expiry / can't be parsed.
export const getTokenExpiry = (token) => {
  const claims = parseJwt(token)
  return claims?.exp ? claims.exp * 1000 : null
}

// True once the token's `exp` has passed. Tokens without an exp never expire here.
export const isTokenExpired = (token) => {
  const exp = getTokenExpiry(token)
  return exp != null && Date.now() >= exp
}

// Build the user object we store in auth state from a JWT's claims.
export const userFromToken = (token) => {
  const claims = parseJwt(token)
  if (!claims) return null
  return {
    id: claims.id ?? claims.sub,
    name: claims.name || claims.email?.split('@')[0] || 'User',
    email: claims.email,
    role: claims.role || 'customer',
    googleId: claims.googleId,
  }
}

// Email/password login. POST /api/auth/login → { token, userId, role, ... }.
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

// Create a new user in the backend. POST /api/users/add with { name, email,
// password }. The axios instance attaches the token (if any) automatically.
export const register = async ({ name, email, password }) => {
  const { data } = await api.post('/users/add', { name, email, password })
  return data
}

// Fetch the full profile (name, avatar, email, role, …) for a user id.
// GET /api/users/get/:id?userId=:id — the axios instance attaches the token.
export const fetchUserById = async (id) => {
  const { data } = await api.get(`/users/get/${id}`, { params: { userId: id } })
  return data?.user || data || null
}

// Clear the backend Google session/cookie. The endpoint is best-effort — if it
// is missing or errors, we still clear local auth state via the caller.
export const logout = async () => {
  try {
    await api.get('/auth/logout')
  } catch {
    /* ignore — server logout is best-effort */
  }
  localStorage.removeItem('token')
}
