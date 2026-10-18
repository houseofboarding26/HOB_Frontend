import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getAllPayments } from '../../services/paymentService'
import { formatDate } from '../../utils/formatDate'

const STATUS_STYLE = {
  captured: 'bg-success/10 text-success',
  created: 'bg-primary/20 text-yellow-700',
  failed: 'bg-error/10 text-error',
  refunded: 'bg-error/10 text-error',
}

const PAGE_SIZE = 10

// Long ids → short, readable slice (full value on hover / click-to-copy).
const shortId = (id) => {
  const s = String(id || '')
  return s.length > 10 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadPayments = async (p = page) => {
    setLoading(true)
    setError(false)
    try {
      const res = await getAllPayments({ page: p, limit: PAGE_SIZE })
      setPayments(res.payments)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      console.error('Failed to load payments', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Initial load. State updates run after the await so nothing is set
  // synchronously inside the effect body.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await getAllPayments({ page: 1, limit: PAGE_SIZE })
        if (!active) return
        setPayments(res.payments)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } catch (err) {
        console.error('Failed to load payments', err)
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const goToPage = (p) => {
    const next = Math.min(Math.max(1, p), totalPages)
    if (next === page) return
    setPage(next)
    loadPayments(next)
  }

  const copyId = (id) => {
    navigator.clipboard?.writeText(String(id))
    toast.success('Copied')
  }

  const currentPage = page
  const pageStart = (currentPage - 1) * PAGE_SIZE

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-500 mt-1">Monitor all transactions and platform revenue.</p>
        </div>
        <button
          onClick={() => loadPayments()}
          disabled={loading}
          title="Refresh"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-secondary disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={28} className="animate-spin mb-3" />
          Loading payments…
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertCircle size={28} className="text-error mb-3" />
          <p className="text-gray-700 font-medium">Couldn't load payments.</p>
          <p className="text-gray-400 text-sm mt-1">Check your connection or sign in again, then retry.</p>
          <button
            onClick={() => loadPayments()}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-white hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                {['Order ID', 'Booking ID', 'Payment ID', 'Amount', 'Date', 'Status'].map((h, i) => (
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
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4 pl-6">
                    {p.orderId ? (
                      <button
                        onClick={() => copyId(p.orderId)}
                        title={`${p.orderId} · click to copy`}
                        className="group inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                      >
                        {shortId(p.orderId)}
                        <Copy size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-gray-400 italic">null</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.bookingId ? (
                      <button
                        onClick={() => copyId(p.bookingId)}
                        title={`${p.bookingId} · click to copy`}
                        className="group inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                      >
                        {shortId(p.bookingId)}
                        <Copy size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-gray-400 italic">null</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.paymentId ? (
                      <button
                        onClick={() => copyId(p.paymentId)}
                        title={`${p.paymentId} · click to copy`}
                        className="group inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 transition-colors"
                      >
                        {shortId(p.paymentId)}
                        <Copy size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ) : (
                      <span className="font-mono text-xs text-gray-400 italic">null</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(p.date)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-12 text-gray-400">No payments found.</div>
        )}

        {/* ── Pagination (server-side) ───────────────────────────────────────────── */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{pageStart + 1}</span>–
              <span className="font-medium text-gray-700">{pageStart + payments.length}</span> of{' '}
              <span className="font-medium text-gray-700">{total}</span> payments
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
    </div>
  )
}
