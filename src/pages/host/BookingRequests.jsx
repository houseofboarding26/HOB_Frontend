import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { resolveHostIdForUser } from '../../services/hostService'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLE = {
  completed:  'bg-success/10 text-success',
  scheduled:  'bg-primary/20 text-yellow-700',
  confirmed:  'bg-primary/20 text-yellow-700',
  cancelled:  'bg-error/10 text-error',
  canceled:   'bg-error/10 text-error',
  pending:    'bg-gray-100 text-gray-600',
}

function normalizeBooking(b) {
  const pets = Array.isArray(b.pets) ? b.pets : []
  const petName = pets.map((p) => p.petName || p.name).filter(Boolean).join(', ')
    || b.petName || b.pet?.name || 'Pet'
  const petType = pets.map((p) => p.petType || p.species).filter(Boolean).join(', ')
    || b.petType || b.pet?.type || ''

  return {
    id: b.id || b._id || b.bookingId,
    customerName: b.customerName || b.customer?.name || b.userName || '—',
    petName,
    petType,
    checkIn:  b.checkIn  || b.checkInDate  || b.startDate  || '',
    checkOut: b.checkOut || b.checkOutDate || b.endDate    || '',
    status: String(b.status || '').toLowerCase(),
    total: Number(
      b.amountSummary?.totalAmount ?? b.totalAmount ?? b.total ?? b.amount ?? 0
    ),
    notes: b.specialInstructions || b.notes || '',
  }
}

export default function BookingRequests() {
  const { user } = useAuth()
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [filter, setFilter]       = useState('all')

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        // Resolve this host's ID (same pattern as HostDashboard).
        let hostId = user.hostId
        if (!hostId) hostId = await resolveHostIdForUser(user.id, token)
        if (!hostId || cancelled) return

        // Try the host-specific admin endpoint first; if it returns 403,
        // fall back to the standard bookings endpoint filtered by hostId.
        let res
        try {
          res = await axios.get(
            `/api/bookings/admin/get_a_host_bookings/${hostId}`,
            { headers }
          )
        } catch (e) {
          if (e?.response?.status === 403) {
            res = await axios.get('/api/bookings/get', {
              params: { hostId },
              headers,
            })
          } else {
            throw e
          }
        }
        if (cancelled) return

        const raw = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : res.data?.bookings || []

        setBookings(raw.map(normalizeBooking))
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load bookings', err)
          setError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, user?.hostId])

  const FILTERS = ['all', 'scheduled', 'confirmed', 'completed', 'cancelled']
  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((r) => r.status === filter || (filter === 'cancelled' && r.status === 'canceled'))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Booking Requests</h1>
        <p className="text-gray-500 mt-1">All bookings are automatically confirmed.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-secondary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-secondary" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 text-gray-400">Failed to load bookings. Please try again.</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🐾</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {r.petName}
                      {r.petType && <span className="font-normal text-gray-500"> ({r.petType})</span>}
                    </p>
                    <p className="text-sm text-gray-500">Owner: {r.customerName}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
                      <CalendarDays size={14} />
                      <span>{formatDate(r.checkIn)} – {formatDate(r.checkOut)}</span>
                    </div>
                    {r.notes && <p className="text-sm text-gray-400 mt-1 italic">"{r.notes}"</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600'}`}>
                    {r.status}
                  </span>
                  {r.total > 0 && (
                    <p className="font-bold text-gray-900">₹{r.total.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">No bookings found.</div>
          )}
        </div>
      )}
    </div>
  )
}
