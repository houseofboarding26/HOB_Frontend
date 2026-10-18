import { useState, useEffect } from 'react'
import { Users, BookOpen, Loader2 } from 'lucide-react'
import { getAllBookings } from '../../services/adminBookingService'
import { getAllUsers } from '../../services/userService'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLE = {
  scheduled: 'bg-primary/20 text-yellow-700',
  initiated: 'bg-gray-100 text-gray-500',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-error/10 text-error',
}

// Sort by booking date (newest first). Falls back to check-in when the created
// date is missing.
const bookingDate = (b) => new Date(b.bookedAt || b.checkIn || 0).getTime()

export default function AdminDashboard() {
  const [totalBookings, setTotalBookings] = useState(0)
  const [recentBookings, setRecentBookings] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [roleCounts, setRoleCounts] = useState({ customer: 0, host: 0, admin: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // Bookings: total count + 5 most recent (sorted client-side).
        const bookingsRes = await getAllBookings({ page: 1, limit: 50 })
        if (active) {
          setTotalBookings(bookingsRes.total)
          const sorted = [...bookingsRes.bookings].sort((a, b) => bookingDate(b) - bookingDate(a))
          setRecentBookings(sorted.slice(0, 5))
        }

        // Users: total + role breakdown (fetched in bulk so counts are exact).
        const usersRes = await getAllUsers({ page: 1, limit: 1000 })
        if (active) {
          setTotalUsers(usersRes.total || usersRes.users.length)
          const counts = { customer: 0, host: 0, admin: 0 }
          usersRes.users.forEach(u => { if (counts[u.role] !== undefined) counts[u.role] += 1 })
          setRoleCounts(counts)
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const stats = [
    { icon: Users, label: 'Total Users', value: loading ? '—' : totalUsers, color: 'bg-secondary/10 text-secondary' },
    { icon: BookOpen, label: 'Total Bookings', value: loading ? '—' : totalBookings, color: 'bg-primary/10 text-yellow-600' },
  ]

  const breakdownTotal = roleCounts.customer + roleCounts.host + roleCounts.admin
  const breakdown = [
    { label: 'Customers', count: roleCounts.customer, color: 'bg-secondary' },
    { label: 'Hosts', count: roleCounts.host, color: 'bg-success' },
    { label: 'Admins', count: roleCounts.admin, color: 'bg-primary' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform-wide overview and management.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8 max-w-2xl">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentBookings.map(b => (
                <div key={b.id} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.customer} → {b.host}</p>
                    <p className="text-xs text-gray-400">{b.petName} · {formatDate(b.checkIn)}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">User Breakdown</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {breakdown.map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${breakdownTotal ? (count / breakdownTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
