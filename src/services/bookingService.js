import axios from 'axios'
import { mockBookings } from '../mock/bookings'
import { EMERGENCY_BOARDING_PRICE } from '../config/pricing'

export const getBookings = async () => mockBookings
export const getBookingById = async (id) => mockBookings.find((b) => b.id === id)
export const createBooking = async (data) => ({ ...data, id: Date.now(), status: 'pending' })
export const updateBooking = async (id, data) => ({ ...data, id })

// ── Customer bookings (real API) ──────────────────────────────────────────────

// Both the platform fee (6%) and GST (18%) apply to the boarding subtotal —
// mirrors BookingFlow so a booking's total here matches what the customer paid.
const PLATFORM_FEE_RATE = 0.06
const GST_RATE = 0.18

// Backend bookingType enum → the labels the UI shows.
const BOOKING_TYPE_LABEL = { daily: 'Daily', multidays: 'Multi-day', hourly: 'Emergency' }

// ISO / Date string → "YYYY-MM-DD" (the format the cards + refund calc expect).
const toDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10)
}

// Per-night price for one pet based on its type and (for dogs) size, using the
// host's pricing map from normalizeHost. Same logic as BookingFlow.
function petNightlyPrice(pet, pricing = {}) {
  const type = (pet?.species || '').toLowerCase()
  const size = (pet?.size || '').toLowerCase()
  if (type === 'dog') {
    if (size === 'large')  return pricing.dogLarge  ?? pricing.dogMedium ?? pricing.dogSmall  ?? 0
    if (size === 'medium') return pricing.dogMedium ?? pricing.dogSmall  ?? pricing.dogLarge  ?? 0
    return pricing.dogSmall ?? pricing.dogMedium ?? pricing.dogLarge ?? 0
  }
  if (type === 'cat')  return pricing.cat  ?? 0
  if (type === 'bird') return pricing.bird ?? 0
  return pricing.small ?? 0
}

// Shape a raw booking document from the API into the fields the customer page
// needs. Names (host/pet) and total are resolved/computed separately, since the
// booking record only carries ids.
export function normalizeCustomerBooking(b, i = 0) {
  const rawType = String(b.bookingType || '').toLowerCase()
  return {
    id: b.id || b._id || b.bookingId || i + 1,
    userId: b.userId,
    hostId: b.hostId,
    petIds: Array.isArray(b.petIds) ? b.petIds : [],
    status: String(b.status || '').toLowerCase() || 'confirmed',
    checkIn: toDate(b.checkIn || b.checkInDate || b.startDate),
    checkOut: toDate(b.checkOut || b.checkOutDate || b.endDate),
    bookingType: rawType,
    bookingTypeLabel: BOOKING_TYPE_LABEL[rawType] || b.bookingType || '',
    hasCancellationPolicy: Boolean(b.cancellationProtection),
    amenities: Array.isArray(b.amenities) ? b.amenities : [],
    bookedAt: b.createdAt || b.bookedAt || undefined,
    cancelledBy: b.cancellationBy || b.cancelledBy || undefined,
    cancelReason: b.cancellationReason || b.cancelReason || '',
    // Use the backend's actual paid amount first; only fall back to the
    // amountSummary we sent on creation when the backend doesn't store one.
    // Preserves 0 as a valid value (unpaid/cancelled bookings).
    totalAmount: (() => {
      const raw = b.totalAmount ?? b.total ?? b.amount ?? b.grandTotal
        ?? b.amountSummary?.totalAmount
      if (raw == null) return null
      const n = Number(raw)
      return isNaN(n) ? null : n
    })(),
    _raw: b,
  }
}

// Nights between check-in and check-out (min 0).
const nightsBetween = (checkIn, checkOut) =>
  checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000))
    : 0

// Recompute a booking's grand total from the host pricing + resolved pets +
// amenities, matching BookingFlow's formula (the API doesn't store a total).
// `petsById` maps petId → { species, size }.
export function computeBookingTotal(booking, host, petsById = {}) {
  const round2 = (n) => Math.round(n * 100) / 100
  const pets = (booking.petIds || []).map((id) => petsById[id]).filter(Boolean)
  const chargeableDays = Math.max(1, nightsBetween(booking.checkIn, booking.checkOut))
  const baseTotal = pets.reduce(
    (sum, p) => sum + petNightlyPrice(p, host?.pricing) * chargeableDays,
    0,
  )
  const isEmergency = booking.bookingType === 'hourly'
  const emergencyFee = isEmergency ? (host?.emergencyBoardingPrice ?? EMERGENCY_BOARDING_PRICE) : 0
  const amenitiesTotal = (booking.amenities || []).reduce((s, a) => s + (Number(a.price) || 0), 0)

  // Mirror BookingFlow's pricing formula EXACTLY so a recomputed total matches
  // what the customer was actually charged. (The old formula taxed the whole
  // subtotal at 18% GST, inflating totals — e.g. ₹10,664 instead of ₹9,300.68.)
  const bookingSubtotal = round2(baseTotal + amenitiesTotal + emergencyFee)
  const platformFee     = round2(bookingSubtotal * PLATFORM_FEE_RATE)
  const hostCommission  = round2((baseTotal + amenitiesTotal) * PLATFORM_FEE_RATE)
  const protectionFee   = round2((baseTotal + amenitiesTotal + platformFee) * 0.1)
  const appliedProtection = booking.hasCancellationPolicy ? protectionFee : 0
  const gst             = round2((platformFee + hostCommission + appliedProtection) * GST_RATE)
  return round2(bookingSubtotal + appliedProtection + platformFee + gst)
}

// Fetch the logged-in customer's own bookings. GET /api/bookings/get?userId=:id
// (the axios instance attaches the token). Returns normalized rows.
export async function getMyBookings(userId) {
  const token = localStorage.getItem('token')
  const res = await axios.get('/api/bookings/get', {
    params: { userId },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const list =
    res.data?.data ||
    res.data?.bookings ||
    res.data?.docs ||
    (Array.isArray(res.data) ? res.data : [])
  return list.map(normalizeCustomerBooking)
}

// Cancel a booking. Same endpoint/contract the admin uses: the owning customer's
// id goes as a query param and the reason in the body.
// PUT /api/bookings/cancel/:id?userId=:userId  body { cancellationReason }
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
