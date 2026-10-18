import { useState, useEffect } from 'react'
import { X, ShieldCheck, AlertCircle, Loader2, RefreshCw, ChevronLeft, ChevronRight, Copy, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getAllBookings, cancelBooking } from '../../services/adminBookingService'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLE = {
  completed: 'bg-success/10 text-success',
  scheduled: 'bg-primary/20 text-yellow-700',
  initiated: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-error/10 text-error',
}

const PAGE_SIZE = 10

// Booking ids are long UUIDs — show a short, readable slice (full value on hover).
const shortId = (id) => {
  const s = String(id)
  return s.length > 10 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s
}

export default function AllBookings() {
  const [filter, setFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [page, setPage] = useState(1)
  // Custom tooltip: { text, x, y } positioned with fixed coords so it escapes
  // the table's overflow clipping. null when nothing is hovered.
  const [tooltip, setTooltip] = useState(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch one page from the server. Pagination + status filtering are both
  // done backend-side, so every filter/page change re-queries the API.
  const loadBookings = async (p = page, f = filter) => {
    setLoading(true)
    setError(false)
    try {
      const res = await getAllBookings({ page: p, limit: PAGE_SIZE, status: f })
      setBookings(res.bookings)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Failed to load bookings', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Initial load. State updates run after the await (not synchronously in the
  // effect body) and are guarded so a fast unmount can't set state.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await getAllBookings({ page: 1, limit: PAGE_SIZE, status: 'all' })
        if (!active) return
        setBookings(res.bookings)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch (err) {
        console.error('Failed to load bookings', err)
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const changeFilter = (f) => {
    setFilter(f)
    setPage(1)
    loadBookings(1, f)
  }

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages)
    if (next === page) return
    setPage(next)
    loadBookings(next, filter)
  }

  // The server already returns the correct page + filtered rows.
  const currentPage = page
  const pageStart = (currentPage - 1) * PAGE_SIZE

  const copyId = (id) => {
    navigator.clipboard?.writeText(String(id))
    toast.success('Booking ID copied')
  }

  const openCancelModal = (booking) => {
    setCancelReason('')
    setCancelModal({ booking })
  }

  const confirmCancel = async () => {
    const { booking } = cancelModal
    setCancelling(true)
    try {
      const res = await cancelBooking(booking.id, {
        userId: booking.userId,
        cancellationReason: cancelReason.trim(),
      })
      toast.success(res?.message || `Booking ${shortId(booking.id)} cancelled.`)
      setCancelModal(null)
      // Re-fetch the current page so the table reflects the server's new state.
      loadBookings(currentPage, filter)
    } catch (err) {
      console.error('Failed to cancel booking', err)
      toast.error(err?.response?.data?.message || 'Failed to cancel booking. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const reasonValid = cancelReason.trim().length >= 5

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 mt-1">View and manage every booking on the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['all', 'scheduled', 'initiated', 'completed', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-secondary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary'
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => loadBookings()}
          disabled={loading}
          title="Refresh"
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-secondary disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={28} className="animate-spin mb-3" />
          Loading bookings…
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertCircle size={28} className="text-error mb-3" />
          <p className="text-gray-700 font-medium">Couldn't load bookings.</p>
          <p className="text-gray-400 text-sm mt-1">Check your connection or sign in again, then retry.</p>
          <button
            onClick={() => loadBookings()}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                {['ID', 'Customer', 'Host', 'Pet', 'Dates', 'Amount', 'Status', 'Action'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${
                      h === 'Amount' ? 'text-right' : 'text-left'
                    } ${i === 0 ? 'pl-6' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4 pl-6">
                    <button
                      onClick={() => copyId(b.id)}
                      title={`${b.id} · click to copy`}
                      className="group inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                    >
                      {shortId(b.id)}
                      <Copy size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{b.customer}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{b.host}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      {b.petName}
                      {b.hasCancellationPolicy && (
                        <ShieldCheck size={13} className="text-green-500 shrink-0" title="Cancellation Protected" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(b.checkIn)} – {formatDate(b.checkOut)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">₹{(b.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {b.status}
                      </span>
                      {/* Cancellation reason — custom tooltip on hover */}
                      {b.status === 'cancelled' && b.cancelReason && (
                        <span
                          onMouseEnter={(e) => {
                            const r = e.currentTarget.getBoundingClientRect()
                            setTooltip({ text: b.cancelReason, x: r.left + r.width / 2, y: r.top })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          className="inline-flex items-center text-gray-400 hover:text-gray-600 cursor-help transition-colors"
                        >
                          <Info size={15} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {b.status === 'initiated' && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-400">No bookings found.</div>
        )}

        {/* ── Pagination (server-side) ───────────────────────────────────────────── */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{pageStart + 1}</span>–
              <span className="font-medium text-gray-700">{pageStart + bookings.length}</span> of{' '}
              <span className="font-medium text-gray-700">{total}</span> bookings
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-secondary disabled:opacity-40 disabled:hover:border-gray-200 transition-colors"
              >
                <ChevronLeft size={15} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-300">…</span>}
                    <button
                      onClick={() => goToPage(p)}
                      disabled={loading}
                      className={`min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? 'bg-secondary text-white'
                          : 'text-gray-600 border border-gray-200 hover:border-secondary'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:border-secondary disabled:opacity-40 disabled:hover:border-gray-200 transition-colors"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ── Admin Cancel Modal ───────────────────────────────────────────────────── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Cancel Booking {shortId(cancelModal.booking.id)}</h2>
              <button
                onClick={() => setCancelModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              {[
                ['Customer', cancelModal.booking.customer],
                ['Host', cancelModal.booking.host],
                ['Pet', cancelModal.booking.petName],
                ['Dates', `${formatDate(cancelModal.booking.checkIn)} – ${formatDate(cancelModal.booking.checkOut)}`],
                ['Amount Paid', `₹${(cancelModal.booking.amount || 0).toLocaleString('en-IN')}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
              {cancelModal.booking.hasCancellationPolicy && (
                <div className="flex items-center gap-1.5 pt-1 text-green-600 text-xs font-medium">
                  <ShieldCheck size={13} /> Customer has Cancellation Protection
                </div>
              )}
            </div>

            {/* Reason input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Reason for Cancellation <span className="text-red-400">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Explain why this booking is being cancelled (visible to the customer)…"
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
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom tooltip (cancellation reason) ───────────────────────────────── */}
      {tooltip && (
        <div
          style={{ left: tooltip.x, top: tooltip.y - 10 }}
          className="fixed z-100 -translate-x-1/2 -translate-y-full pointer-events-none w-max max-w-xs"
        >
          <div className="bg-gray-900 text-white text-xs leading-relaxed rounded-lg px-3 py-2 shadow-xl">
            <p className="font-semibold text-gray-400 mb-0.5">Cancellation reason</p>
            <p className="break-words">{tooltip.text}</p>
          </div>
          <div className="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-[5px]" />
        </div>
      )}
    </div>
  )
}
