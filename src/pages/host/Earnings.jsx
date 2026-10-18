import { mockEarnings, mockHostRequests } from '../../mock/data'
import { DollarSign, TrendingUp, CalendarCheck } from 'lucide-react'

export default function Earnings() {
  const totalEarnings = mockEarnings.reduce((s, m) => s + m.amount, 0)
  const thisMonth = mockEarnings[mockEarnings.length - 1].amount
  const completedBookings = mockHostRequests.filter(r => r.status === 'confirmed').length
  const maxAmount = Math.max(...mockEarnings.map(m => m.amount))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-500 mt-1">Track your hosting income over time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <DollarSign className="text-success" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{totalEarnings.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500">Total Earned</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{thisMonth.toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <CalendarCheck className="text-secondary" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
            <p className="text-sm text-gray-500">Bookings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-gray-900 mb-4 sm:mb-6">Monthly Earnings</h2>
        <div className="flex items-end gap-1 sm:gap-3 h-40 sm:h-48 overflow-x-auto">
          {mockEarnings.map(({ month, amount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2 min-w-[32px]">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">₹{amount.toLocaleString('en-IN')}</span>
              <div
                className="w-full rounded-t-lg bg-secondary hover:bg-secondary-dark transition-colors"
                style={{ height: `${(amount / maxAmount) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Payout History</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {mockEarnings.slice().reverse().map(({ month, amount }) => (
            <div key={month} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{month} 2026 Payout</p>
                <p className="text-sm text-gray-500">Bank transfer</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                <span className="text-xs text-success font-medium">Paid</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
