import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, User, X, Mail, Calendar, BookOpen, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { getAllUsers, getUserById } from '../../services/userService'
import { formatDate } from '../../utils/formatDate'

const ROLE_STYLE = {
  customer: 'bg-secondary/10 text-secondary',
  host:     'bg-success/10 text-success',
  admin:    'bg-primary/20 text-yellow-700',
}

const HOST_STATUS_STYLE = {
  pending:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
  verified: 'bg-success/10 text-success border border-success/20',
  approved: 'bg-success/10 text-success border border-success/20',
  rejected: 'bg-error/10 text-error border border-error/20',
}

const PAGE_SIZE = 10

// Modal for customers / admins — fetches the full profile from the API by id.
function UserModal({ userId, fallback, onClose }) {
  const [user, setUser] = useState(fallback || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const u = await getUserById(userId)
        if (active && u) setUser(u)
      } catch (err) {
        console.error('Failed to load user', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
              <User size={16} className="text-secondary" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{user?.name || '—'}</p>
              {user?.role && (
                <span className={`text-xs font-medium capitalize px-1.5 py-0.5 rounded-full ${ROLE_STYLE[user.role] ?? 'bg-gray-100 text-gray-500'}`}>
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {[
              { Icon: Mail,     label: 'Email',    value: user?.email    },
              { Icon: Calendar, label: 'Joined',   value: formatDate(user?.joined) },
              { Icon: BookOpen, label: 'Bookings', value: user?.bookings },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon size={14} className="text-gray-400 shrink-0" />
                <div className="flex items-center justify-between flex-1">
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{value ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function UserManagement() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewUser, setViewUser] = useState(null)

  // Fetch a page from the server. Search maps to the `name`/`email` params
  // (an "@" in the term is treated as an email search).
  const loadUsers = async (p, role, term) => {
    setLoading(true)
    setError(false)
    try {
      const params = { page: p, limit: PAGE_SIZE, role }
      const q = term?.trim()
      // Search across both name and email.
      if (q) { params.name = q; params.email = q }
      const res = await getAllUsers(params)
      setUsers(res.users)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Failed to load users', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search — also handles the initial load (search starts empty).
  // Runs inside a timeout so no state is set synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      loadUsers(1, roleFilter, search)
    }, search ? 400 : 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleRoleFilter = (f) => {
    setRoleFilter(f)
    setPage(1)
    loadUsers(1, f, search)
  }

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages)
    if (next === page) return
    setPage(next)
    loadUsers(next, roleFilter, search)
  }

  const handleView = (u) => {
    // Pass the hostId we already have from the users list so the host profile
    // can load directly without scanning the host list to resolve it.
    if (u.role === 'host') navigate(`/admin/users/${u.id}`, { state: { hostId: u.hostId } })
    else setViewUser(u)
  }

  const currentPage = page
  const pageStart = (currentPage - 1) * PAGE_SIZE

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all customers, hosts, and admins.</p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {['all', 'customer', 'host', 'admin'].map(f => (
            <button
              key={f}
              onClick={() => handleRoleFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                roleFilter === f
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 w-full sm:w-64 bg-white"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertCircle size={28} className="text-error mb-3" />
          <p className="text-gray-700 font-medium">Couldn't load users.</p>
          <p className="text-gray-400 text-sm mt-1">Check your connection or sign in again, then retry.</p>
          <button
            onClick={() => loadUsers(currentPage, roleFilter, search)}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 720 }}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Bookings', 'Host Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin inline-block" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : users.map(u => {
                const isHost = u.role === 'host'
                return (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {isHost ? (
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}`, { state: { hostId: u.hostId } })}
                          className="text-secondary hover:underline font-semibold text-left flex items-center gap-1.5"
                        >
                          <User size={13} className="shrink-0" />
                          {u.name}
                        </button>
                      ) : u.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_STYLE[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(u.joined) || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{u.bookings}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.hostStatus ? (
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${HOST_STATUS_STYLE[u.hostStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                          {u.hostStatus}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleView(u)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          isHost
                            ? 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <User size={12} /> View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {total === 0 ? 0 : pageStart + 1}–{pageStart + users.length} of {total} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                .map((n, idx, arr) => (
                  <span key={n} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== n - 1 && <span className="px-1 text-gray-300">…</span>}
                    <button
                      onClick={() => goToPage(n)}
                      disabled={loading}
                      className={`w-8 h-8 text-xs font-semibold rounded-lg border transition-colors ${
                        currentPage === n
                          ? 'bg-secondary text-white border-secondary'
                          : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-secondary hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {viewUser && (
        <UserModal userId={viewUser.id} fallback={viewUser} onClose={() => setViewUser(null)} />
      )}
    </div>
  )
}
