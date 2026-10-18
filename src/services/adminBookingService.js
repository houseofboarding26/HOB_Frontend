import axios from 'axios'

// Map the many statuses the backend may use onto the three the admin UI knows
// about (Scheduled / Completed / Cancelled). Anything unrecognised is passed
// through untouched so it still renders (just without a coloured pill).
const STATUS_MAP = {
  confirmed: 'scheduled',
  pending: 'scheduled',
  upcoming: 'scheduled',
  active: 'scheduled',
  ongoing: 'scheduled',
  scheduled: 'scheduled',
  completed: 'completed',
  complete: 'completed',
  finished: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
}

// ISO / Date string → "YYYY-MM-DD" (the format the table + refund calc expect).
const toDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

const pickName = (obj) => {
  if (!obj || typeof obj !== 'object') return ''
  return (
    obj.name ||
    obj.fullName ||
    obj.propertyName ||
    [obj.firstName, obj.lastName].filter(Boolean).join(' ') ||
    ''
  )
}

// The admin booking documents come back populated (host, customer, pets), but
// exact field names vary across API versions — so we defensively probe the
// likely shapes, mirroring how normalizeHost handles host payloads.
export function normalizeAdminBooking(b, i = 0) {
  const pets = b.pets || b.petIds || b.petProfiles || []
  const petName =
    b.petName ||
    (Array.isArray(pets)
      ? pets.map((p) => (typeof p === 'string' ? p : p.petName || p.name)).filter(Boolean).join(', ')
      : '') ||
    '—'

  const customer =
    b.customerName ||
    pickName(b.customer || b.user || b.userId || b.customerId) ||
    '—'

  const host =
    b.hostName ||
    pickName(b.host || b.hostId || b.property) ||
    '—'

  const rawStatus = String(b.status || '').toLowerCase()
  const status = STATUS_MAP[rawStatus] || rawStatus || 'scheduled'

  // Prefer the amountSummary total the customer actually paid (exact, incl.
  // paise) over any rounded top-level total the backend may also store.
  const amount = Number(
    b.amountSummary?.totalAmount ?? b.totalAmount ?? b.total ?? b.amount ?? b.grandTotal ?? b.pricing?.total ?? 0
  )

  // The booking's owning customer — needed as the `userId` query param when
  // cancelling the booking.
  const userId =
    b.userId ||
    b.user?._id || b.user?.id ||
    b.customer?._id || b.customer?.id ||
    b.customerId ||
    undefined

  return {
    id: b._id || b.id || b.bookingId || i + 1,
    userId,
    customer,
    host,
    petName,
    checkIn: toDate(b.checkIn || b.checkInDate || b.startDate),
    checkOut: toDate(b.checkOut || b.checkOutDate || b.endDate),
    status,
    amount,
    bookedAt: b.createdAt || b.bookedAt || b.bookingDate || undefined,
    hasCancellationPolicy: Boolean(
      b.cancellationProtection ?? b.hasCancellationPolicy ?? b.cancellationPolicy
    ),
    cancelledBy: b.cancelledBy,
    cancelReason: b.cancelReason || b.cancellationReason || '',
  }
}

// Fetch one page of bookings (admin only). Pagination AND status filtering are
// handled server-side via the `page`, `limit` and `status` query params.
//
// Returns { bookings, total, totalPages, page } — the normalized rows for the
// current page plus the pagination metadata the table needs.
export async function getAllBookings({ page = 1, limit = 10, status } = {}) {
  const token = localStorage.getItem('token')

  const params = { page, limit }
  // "all" means no filter — only send status when the admin picked a real one.
  if (status && status !== 'all') params.status = status

  const res = await axios.get('/api/bookings/admin/get', {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  // Accept both { data: [...] } and a bare array.
  const list =
    res.data?.data ||
    res.data?.bookings ||
    res.data?.docs ||
    res.data?.results ||
    (Array.isArray(res.data) ? res.data : [])
  const bookings = list.map(normalizeAdminBooking)

  // Pagination metadata — probe the common field names, falling back to a
  // sensible derivation when the API doesn't provide them.
  const total = Number(
    res.data?.total ??
    res.data?.totalCount ??
    res.data?.count ??
    res.data?.totalRecords ??
    res.data?.pagination?.total ??
    res.data?.pagination?.totalCount ??
    bookings.length
  )
  const totalPages = Number(
    res.data?.totalPages ??
    res.data?.pages ??
    res.data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(total / limit))
  )
  const currentPage = Number(res.data?.page ?? res.data?.pagination?.page ?? page)

  return { bookings, total, totalPages, page: currentPage }
}

// Cancel a booking. `userId` (the booking's owning customer) is sent as a query
// param and the reason goes in the body, matching the cancel endpoint contract.
export async function cancelBooking(id, { userId, cancellationReason } = {}) {
  const token = localStorage.getItem('token')
  const res = await axios.put(
    `/api/bookings/cancel/${id}`,
    { cancellationReason },
    {
      params: userId ? { userId } : undefined,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  )
  return res.data
}
