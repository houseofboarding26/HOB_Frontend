import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { CalendarDays, ShieldCheck, X, AlertCircle, Loader2, PawPrint } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { calculateRefund } from '../../utils/cancellationPolicy'
import { getMyBookings, cancelBooking, computeBookingTotal } from '../../services/bookingService'
import { getHostById } from '../../services/hostService'
import { normalizeHost } from '../../utils/normalizeHost'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLE = {
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-error/10 text-error',
  canceled: 'bg-error/10 text-error',
}

// A booking can only be cancelled while it's still upcoming.
const CANCELLABLE = new Set(['confirmed', 'pending', 'scheduled', 'upcoming', 'initiated'])

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Load the customer's bookings, then resolve the host name + pet names and
  // compute each total (the booking record only stores ids, no names/total).
  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    setError(false)
    try {
      const raw = await getMyBookings(user.id)

      // Pet profiles (id → name/species/size), fetched once for this customer.
      const petsById = {}
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/petProfile/get', {
          params: { userId: user.id },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
        list.forEach((p) => { petsById[p.id] = { name: p.petName, species: p.petType, size: p.petSize } })
      } catch { /* names fall back to a generic label */ }

      // Unique hosts referenced by these bookings (for name + pricing).
      const hostIds = [...new Set(raw.map((b) => b.hostId).filter(Boolean))]
      const hostEntries = await Promise.all(
        hostIds.map(async (hid) => {
          try { return [hid, normalizeHost(await getHostById(hid))] }
          catch { return [hid, null] }
        })
      )
      const hostsById = Object.fromEntries(hostEntries)

      const enriched = raw.map((b) => {
        const host = hostsById[b.hostId]
        const petName =
          b.petIds.map((id) => petsById[id]?.name).filter(Boolean).join(', ') || 'Your Pet'
        return {
          ...b,
          petName,
          hostName: host?.name || 'Host',
          // Use the exact amount stored on the booking (what the customer paid).
          // Only recompute when the backend didn't store a total.
          total: b.totalAmount ?? computeBookingTotal(b, host, petsById),
        }
      })
      setBookings(enriched)
    } catch (err) {
      console.error('Failed to load bookings', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const openCancelModal = (booking) => {
    setCancelReason('')
    setCancelModal({ booking, refundInfo: calculateRefund(booking) })
  }

  const confirmCancel = async () => {
    if (cancelling) return
    const { booking, refundInfo } = cancelModal
    setCancelling(true)
    try {
      await cancelBooking(booking.id, {
        userId: booking.userId || user?.id,
        cancellationReason: cancelReason.trim(),
      })
      setBookings((prev) => prev.map((b) =>
        b.id === booking.id
          ? { ...b, status: 'cancelled', cancelledBy: 'customer', cancelReason: cancelReason.trim() }
          : b
      ))
      toast.success(
        refundInfo.refundAmount > 0
          ? `Booking cancelled. ₹${refundInfo.refundAmount.toLocaleString('en-IN')} will be refunded within 5–7 business days.`
          : 'Booking cancelled. No refund applicable as per policy.'
      )
      setCancelModal(null)
    } catch (err) {
      console.error('Cancel failed', err)
      toast.error(err?.response?.data?.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const reasonValid = cancelReason.trim().length >= 5

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">All your past and upcoming stays.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-3">Couldn’t load your bookings.</p>
          <button onClick={load} className="text-secondary font-semibold underline">Retry</button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
            <PawPrint size={26} className="text-secondary" />
          </div>
          <p className="text-gray-700 font-semibold">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-1">Your past and upcoming stays will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const canCancel = CANCELLABLE.has(b.status)
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-2xl">🐾</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{b.petName}</p>
                      <p className="text-sm text-gray-500">Hosted by {b.hostName}</p>
                      {b.hasCancellationPolicy && b.status !== 'cancelled' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1">
                          <ShieldCheck size={11} /> Cancellation Protected
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <CalendarDays size={14} />
                        <span>{formatDate(b.checkIn)} – {formatDate(b.checkOut)}</span>
                      </div>
                      {/* Cancellation reason visible to customer */}
                      {(b.status === 'cancelled' || b.status === 'canceled') && b.cancelReason && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 max-w-xs">
                          <AlertCircle size={12} className="shrink-0 mt-0.5 text-gray-400" />
                          <span>
                            <span className="font-semibold text-gray-600">
                              {b.cancelledBy === 'admin' ? 'Cancelled by Admin: ' : 'Your reason: '}
                            </span>
                            {b.cancelReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">₹{Number(b.total || 0).toLocaleString('en-IN')}</p>
                    {canCancel && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium underline underline-offset-2 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Cancel Confirmation Modal ────────────────────────────────────────────── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Cancel Booking</h2>
              <button
                onClick={() => !cancelling && setCancelModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              {[
                ['Pet', cancelModal.booking.petName],
                ['Host', cancelModal.booking.hostName],
                ['Dates', `${formatDate(cancelModal.booking.checkIn)} – ${formatDate(cancelModal.booking.checkOut)}`],
                ['Amount Paid', `₹${Number(cancelModal.booking.total || 0).toLocaleString('en-IN')}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
            </div>

            <div className={`rounded-xl p-4 mb-4 border ${
              cancelModal.refundInfo.refundAmount > 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-bold mb-1 ${cancelModal.refundInfo.refundAmount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                Refund: ₹{cancelModal.refundInfo.refundAmount.toLocaleString('en-IN')} ({cancelModal.refundInfo.percent}%)
              </p>
              <p className={`text-xs leading-relaxed ${cancelModal.refundInfo.refundAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cancelModal.refundInfo.reason}
              </p>
            </div>

            {/* Reason input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Reason for Cancellation <span className="text-red-400">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Please tell us why you're cancelling this booking…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              {cancelReason.trim().length > 0 && !reasonValid && (
                <p className="text-xs text-red-500 mt-1">Please enter at least 5 characters.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={!reasonValid || cancelling}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                  reasonValid && !cancelling ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {cancelling && <Loader2 size={15} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
