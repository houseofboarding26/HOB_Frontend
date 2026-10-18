import axios from 'axios'

// localStorage hint that a listing exists for a user (id + name). It's only a
// cache — the authoritative data always comes from the API.
export const hostHintKey = (userId) => `hostProperty_${userId}`

const readHint = (userId) => {
  try { return JSON.parse(localStorage.getItem(hostHintKey(userId)) || 'null') }
  catch { return null }
}

// Persist the lightweight hint so the (possibly expensive) resolve below only
// runs once per browser/device.
export const saveHostHint = (userId, hostId, propertyName) => {
  if (!userId || !hostId) return
  try {
    const prev = readHint(userId) || {}
    localStorage.setItem(hostHintKey(userId), JSON.stringify({ ...prev, hostId, propertyName }))
  } catch { /* storage full — ignore, we'll just re-resolve next time */ }
}

// Find the host listing that belongs to `userId`.
//
// The users endpoint (/api/users/get?role=host) embeds the host record
// (`host: { id, status }`) for every host user — including unverified hosts,
// which never appear in the public /api/host/get list. So we page through the
// users list and read host.id for the matching user. This avoids the old N+1
// scan of the host list (one get-by-id per host) and works for unverified
// hosts too. The result is cached via saveHostHint so this only runs once.
export async function resolveHostIdForUser(userId, token) {
  if (!userId) return null

  // Fast path: we already know it.
  const hinted = readHint(userId)?.hostId
  if (hinted) return hinted

  const auth = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  const LIMIT = 100
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    let payload
    try {
      const res = await axios.get('/api/users/get', {
        params: { role: 'host', page, limit: LIMIT },
        ...auth,
      })
      payload = res.data?.users ?? res.data
    } catch {
      return null
    }

    const list = payload?.data || (Array.isArray(payload) ? payload : [])
    totalPages = Number(payload?.totalPages) || 1

    const match = list.find(u => String(u.id || u._id) === String(userId))
    if (match) {
      const hid = match.host?.id || match.host?._id || null
      if (hid) {
        saveHostHint(userId, hid, match.propertyName)
        return hid
      }
      return null // user found but has no host record
    }

    page++
  }
  return null
}

// Fetch the raw host record by host id.
export async function getHostById(hostId) {
  const token = localStorage.getItem('token')
  const res = await axios.get(`/api/host/get/${hostId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return res.data?.data || res.data || null
}

// Admin: update host fields. PUT /api/host/admin/put/:hostId?userId=:userId
// Accepts any of: status ("verified" | "rejected"), accountSuspendReason,
// topRated, physicalverification, mostPopullar.
export async function updateHostAdmin(hostId, body, userId) {
  const token = localStorage.getItem('token')
  const res = await axios.put(
    `/api/host/admin/put/${hostId}`,
    body,
    {
      params: userId ? { userId } : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )
  return res.data
}
