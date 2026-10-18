import axios from 'axios'

// ISO / Date string → "YYYY-MM-DD".
const toDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

// The admin payments endpoint returns raw Razorpay-style records. Normalize the
// bits the Payments table needs.
export function normalizePayment(p, i = 0) {
  return {
    id: p.id || p.paymentId || p.orderId || i + 1,
    paymentId: p.paymentId || null,
    orderId: p.orderId || null,
    bookingId: p.bookingId || '',
    amount: Number(p.amount) || 0,
    status: String(p.status || '').toLowerCase(),
    date: toDate(p.createdAt || p.updatedAt),
  }
}

// Fetch one page of payments (admin only). Pagination is handled server-side via
// the `page` + `limit` query params.
//
// Returns { payments, total, totalPages, page }.
export async function getAllPayments({ page = 1, limit = 10 } = {}) {
  const token = localStorage.getItem('token')
  const res = await axios.get('/api/payment/admin/get-all-payments', {
    params: { page, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  // Response shape: { success, message, data: { data: [...], total, page, ... } }.
  const payload = res.data?.data ?? res.data
  const list =
    payload?.data ||
    payload?.payments ||
    (Array.isArray(payload) ? payload : []) ||
    []
  const payments = (Array.isArray(list) ? list : []).map(normalizePayment)

  const total = Number(payload?.total ?? res.data?.total ?? payments.length)
  const totalPages = Number(
    payload?.totalPages ?? res.data?.totalPages ?? Math.max(1, Math.ceil(total / limit))
  )
  const currentPage = Number(payload?.page ?? res.data?.page ?? page)

  return { payments, total, totalPages, page: currentPage }
}
