import axios from 'axios'

// ISO / Date string → "YYYY-MM-DD".
const toDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

export function normalizeUser(u, i = 0) {
  return {
    id: u.id || u._id || i + 1,
    name: u.name || '—',
    email: u.email || '—',
    role: String(u.role || '').toLowerCase(),
    joined: toDate(u.createdAt),
    bookings: u.bookingCount ?? u.bookings ?? 0,
    hostStatus: u.hostStatus ?? null,
    // The users endpoint embeds the host record (incl. unverified hosts), so the
    // hostId is available here directly — no need to scan the host list to map
    // userId → hostId.
    hostId: u.host?.id || u.host?._id || null,
    propertyName: u.propertyName ?? null,
  }
}

// Fetch one page of users (admin). Pagination + search are handled server-side
// via `page`, `limit`, and the `name` / `email` / `role` query params.
//
// Returns { users, total, totalPages, page }.
export async function getAllUsers({ page = 1, limit = 10, name, email, role } = {}) {
  const token = localStorage.getItem('token')

  const params = { page, limit }
  if (name) params.name = name
  if (email) params.email = email
  if (role && role !== 'all') params.role = role

  const res = await axios.get('/api/users/get', {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  // Response shape: { users: { data: [...], total, page, limit, totalPages } }.
  const payload = res.data?.users ?? res.data
  const list = payload?.data || (Array.isArray(payload) ? payload : [])
  const users = (Array.isArray(list) ? list : []).map(normalizeUser)

  const total = Number(payload?.total ?? users.length)
  const totalPages = Number(payload?.totalPages ?? Math.max(1, Math.ceil(total / limit)))
  const currentPage = Number(payload?.page ?? page)

  return { users, total, totalPages, page: currentPage }
}

// Fetch a single user's full profile. GET /api/users/get/:id?userId=:id
export async function getUserById(id) {
  const token = localStorage.getItem('token')
  const res = await axios.get(`/api/users/get/${id}`, {
    params: { userId: id },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const u = res.data?.user || res.data?.data || res.data || null
  return u ? normalizeUser(u) : null
}
