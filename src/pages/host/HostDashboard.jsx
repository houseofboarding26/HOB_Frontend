import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { resolveHostIdForUser, saveHostHint } from '../../services/hostService'
import { EMERGENCY_BOARDING_PRICE } from '../../config/pricing'
import { formatDate } from '../../utils/formatDate'
import { mockHostRequests } from '../../mock/data'
import { DollarSign, CheckCircle, ChevronRight, PawPrint, EyeOff, Eye } from 'lucide-react'

const AMENITY_ICONS = {
  swimming: '🏊', extra_walks: '🦮', play_area: '🎾', '24/7_CCTV': '📷',
  veg_meal: '🥗', wet_meal: '🍖', dry_kibble_meal: '🦴', grooming: '✂️',
  pet_store: '🏪', pet_cafe: '☕', vaternity_support: '🏥', daily_cleaning: '🧹',
  vaccination_pet_only: '💉', ticks_control: '🪲', spa: '🛁', jacuzzi: '🛀',
  bubble_bath: '🫧', ac: '❄️', cooler: '💨', live_update: '📱', fresh_water: '💧',
  WiFi: '📶', Parking: '🅿️', Heating: '🔥', Garden: '🌿', Pool: '🏊',
}

const AMENITY_LABELS = {
  swimming: 'Swimming', extra_walks: 'Extra Walks', play_area: 'Play Area',
  '24/7_CCTV': '24/7 CCTV', veg_meal: 'Veg Meal', wet_meal: 'Wet Meal',
  dry_kibble_meal: 'Dry Kibble Meal', grooming: 'Grooming', pet_store: 'Pet Store',
  pet_cafe: 'Pet Cafe', vaternity_support: 'Vet Support', daily_cleaning: 'Daily Cleaning',
  vaccination_pet_only: 'Vaccination Only', ticks_control: 'Ticks Control',
  spa: 'Spa', jacuzzi: 'Jacuzzi', bubble_bath: 'Bubble Bath',
  ac: 'AC', cooler: 'Cooler', live_update: 'Live Update', fresh_water: 'Fresh Water',
}

const STATUS_CONFIG = {
  verified:   { label: 'Verified',              cls: 'bg-green-50 border-green-200 text-green-700',  dot: 'bg-green-500' },
  unverified: { label: 'Pending Verification',  cls: 'bg-amber-50 border-amber-200 text-amber-700',  dot: 'bg-yellow-400 animate-pulse' },
  rejected:   { label: 'Rejected',              cls: 'bg-red-50 border-red-200 text-red-700',        dot: 'bg-red-500' },
  suspend:    { label: 'Suspended',             cls: 'bg-red-50 border-red-200 text-red-700',        dot: 'bg-red-500' },
}

function buildServicesFromAPI(h) {
  const PET_ICONS = { Dog: '🐕', Cat: '🐈', Bird: '🦜', smallPet: '🐾' }
  const services = []
  const hasBoarding  = h.Services?.includes('overnight_multiday_boarding')
  const hasEmergency = h.Services?.includes('emergency_boarding')
  if (hasBoarding) {
    ;(h.pricePerPet || []).forEach(({ petType, price, small, medium, large }) => {
      // Dog has size-based pricing; use small as base display price
      const displayPrice = price ?? small?.price ?? medium?.price ?? large?.price ?? ''
      const label = petType === 'Dog' && (small || medium || large)
        ? `${petType} Boarding (from ₹${small?.price ?? medium?.price ?? large?.price})`
        : `${petType} Boarding`
      services.push({ name: label, icon: PET_ICONS[petType] || '🐾', price: displayPrice, unit: 'night' })
    })
  }
  if (hasEmergency) services.push({ name: 'Emergency Boarding', icon: '⚡', price: h.emergencyBoardingPrice ?? EMERGENCY_BOARDING_PRICE, unit: 'booking' })
  return services
}

export default function HostDashboard() {
  const { user } = useAuth()
  const [hostData, setHostData] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    let cancelled = false
    const token = localStorage.getItem('token')
    const saved = JSON.parse(localStorage.getItem(`hostProperty_${user.id}`) || 'null')

    const fetchById = (hostId) =>
      axios.get(`/api/host/get/${hostId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { if (!cancelled) setHostData(res.data) })
        .catch(() => { if (!cancelled) setHostData(null) })

    setLoading(true)
    ;(async () => {
      // Prefer a known id; otherwise resolve it from the API so a fresh login
      // (or a new device / cleared storage) still finds the existing listing.
      let hostId = user.hostId || saved?.hostId
      if (!hostId) hostId = await resolveHostIdForUser(user.id, token)
      if (cancelled) return
      if (!hostId) { setHostData(null); return }
      saveHostHint(user.id, hostId)
      await fetchById(hostId)
    })().finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [user?.id])

  const confirmed = mockHostRequests.filter(r => r.status === 'confirmed').length
  const earnings  = mockHostRequests.filter(r => r.status === 'confirmed').reduce((s, r) => s + r.total, 0)
  const services  = hostData ? buildServicesFromAPI(hostData) : []
  const amenities = hostData?.amenities || []
  const pets      = (hostData?.boardingOfPets || []).map(p => p === 'smallPet' ? 'Small Pets' : p + 's')
  const status    = STATUS_CONFIG[hostData?.status] || STATUS_CONFIG.unverified

  const todayStr = new Date().toLocaleDateString('en-CA')
  const dpart = (iso) => (iso || '').slice(0, 10) // ISO → YYYY-MM-DD

  // Holidays fetched from the backend for this host.
  const [holidays, setHolidays] = useState([])

  const fetchHolidays = async (hostId) => {
    if (!hostId) return
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/host/holiday/get', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const list = Array.isArray(res.data) ? res.data : res.data?.data || []
      // Only this host's holidays; newest first (recent on top).
      const mine = list
        .filter((h) => String(h.hostId) === String(hostId))
        .sort((a, b) => new Date(b.createdAt || b.fromDate) - new Date(a.createdAt || a.fromDate))
      setHolidays(mine)
    } catch {
      /* ignore — leave holidays empty */
    }
  }

  // Load holidays once we know which host this is.
  useEffect(() => {
    const hid = hostData?._id || hostData?.id
    if (hid) fetchHolidays(hid)
  }, [hostData?._id, hostData?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Currently-active holiday (today within range) or the next upcoming one.
  const activeHoliday   = holidays.find((h) => todayStr >= dpart(h.fromDate) && todayStr <= dpart(h.toDate)) || null
  const upcomingHoliday = !activeHoliday
    ? [...holidays].filter((h) => dpart(h.fromDate) > todayStr).sort((a, b) => dpart(a.fromDate).localeCompare(dpart(b.fromDate)))[0] || null
    : null
  const holidayActive   = !!activeHoliday
  const holidayUpcoming = !!upcomingHoliday
  const profileDisabled = holidayActive || holidayUpcoming
  const currentHoliday  = activeHoliday || upcomingHoliday

  // Keep the flag BrowseHosts reads in sync: hidden only while a holiday is active.
  useEffect(() => {
    localStorage.setItem('hostProfileDisabled', String(holidayActive))
  }, [holidayActive])

  // Holiday modal — hosts pick the date range + reason they'll be unavailable.
  const [holidayOpen, setHolidayOpen] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [holidayReason, setHolidayReason] = useState('')
  const [savingHoliday, setSavingHoliday] = useState(false)

  // Pretty date: "2026-09-10" → "10 Sep 2026".
  const fmtDate = (s) => formatDate(dpart(s))

  // Whole days from today until the given date (0 = today).
  const daysFromToday = (s) => {
    const v = dpart(s)
    if (!v) return 0
    const [y, m, d] = v.split('-').map(Number)
    const target = new Date(y, m - 1, d)
    const now = new Date(todayStr)
    return Math.round((target - now) / 86_400_000)
  }

  const toggleProfile = () => {
    if (profileDisabled) {
      // No cancel endpoint — the profile re-enables automatically after the range.
      toast(
        `Profile re-enables automatically on ${fmtDate(daysFromToday(currentHoliday.toDate) >= 0 ? addOneDay(currentHoliday.toDate) : currentHoliday.toDate)}.`,
        { icon: 'ℹ️' },
      )
    } else {
      setHolidayOpen(true)
    }
  }

  // Next calendar day after a YYYY-MM-DD / ISO date (profile re-enables then).
  function addOneDay(s) {
    const v = dpart(s)
    const [y, m, d] = v.split('-').map(Number)
    const dt = new Date(y, m - 1, d + 1)
    return dt.toLocaleDateString('en-CA')
  }

  const submitHoliday = async () => {
    if (!fromDate || !toDate) { toast.error('Please select both from and to dates.'); return }
    if (toDate < fromDate) { toast.error('"To" date must be after "From" date.'); return }
    setSavingHoliday(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/host/holiday/add',
        { fromDate, toDate, reason: holidayReason },
        { params: { userId: user?.id }, headers: token ? { Authorization: `Bearer ${token}` } : {} },
      )
      setHolidayOpen(false)
      setFromDate(''); setToDate(''); setHolidayReason('')
      await fetchHolidays(hostData?._id || hostData?.id)
      toast.success(
        fromDate <= todayStr
          ? 'Profile hidden for the selected dates.'
          : 'Holiday scheduled — profile will hide on the start date.'
      )
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule the holiday. Please try again.')
    } finally {
      setSavingHoliday(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}. Manage your boarding business.</p>
        </div>

        {/* Profile visibility toggle */}
        <button
          type="button"
          onClick={toggleProfile}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 transition-all text-sm font-semibold ${
            holidayActive
              ? 'border-red-200 bg-red-50 text-red-600'
              : holidayUpcoming
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {profileDisabled ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{holidayActive ? 'Profile Hidden' : holidayUpcoming ? 'Holiday Scheduled' : 'Profile Visible'}</span>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${holidayActive ? 'bg-red-400' : holidayUpcoming ? 'bg-amber-400' : 'bg-green-500'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${profileDisabled ? 'left-0.5' : 'left-5'}`} />
          </div>
        </button>
      </div>

      {holidayActive && (() => {
        const reEnableDays = daysFromToday(activeHoliday.toDate) + 1 // visible the day after toDate
        return (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5">
            <EyeOff size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Your profile is hidden from listings</p>
              <p className="text-xs text-red-500 mt-0.5">
                Hidden from <span className="font-semibold">{fmtDate(activeHoliday.fromDate)}</span> to <span className="font-semibold">{fmtDate(activeHoliday.toDate)}</span>.
                Your profile becomes visible again on <span className="font-semibold">{fmtDate(addOneDay(activeHoliday.toDate))}</span>
                {' '}({reEnableDays === 1 ? 'in 1 day' : `in ${reEnableDays} days`}).
              </p>
              {activeHoliday.reason && <p className="text-xs text-red-400 mt-1 italic">Reason: {activeHoliday.reason}</p>}
            </div>
          </div>
        )
      })()}

      {holidayUpcoming && (() => {
        const startsIn = daysFromToday(upcomingHoliday.fromDate)
        return (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5">
            <EyeOff size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Holiday scheduled</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your profile will be hidden from <span className="font-semibold">{fmtDate(upcomingHoliday.fromDate)}</span> to <span className="font-semibold">{fmtDate(upcomingHoliday.toDate)}</span>
                {' '}({startsIn === 0 ? 'starts today' : startsIn === 1 ? 'starts tomorrow' : `starts in ${startsIn} days`}). It stays visible until then.
              </p>
              {upcomingHoliday.reason && <p className="text-xs text-amber-500 mt-1 italic">Reason: {upcomingHoliday.reason}</p>}
            </div>
          </div>
        )
      })()}

      {/* Past & scheduled holidays — most recent on top */}
      {holidays.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Holiday history</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {holidays.map((h) => {
              const isActive = h === activeHoliday
              const isUpcoming = dpart(h.fromDate) > todayStr
              const state = isActive
                ? { label: 'Active', cls: 'bg-red-50 text-red-600' }
                : isUpcoming
                ? { label: 'Scheduled', cls: 'bg-amber-50 text-amber-600' }
                : { label: 'Ended', cls: 'bg-gray-100 text-gray-400' }
              return (
                <div key={h.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {fmtDate(h.fromDate)} — {fmtDate(h.toDate)}
                    </p>
                    {h.reason && <p className="text-xs text-gray-400 truncate">{h.reason}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${state.cls}`}>{state.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Listing status banner */}
      {hostData ? (
        <div className={`mb-6 flex items-center gap-4 border rounded-2xl px-5 py-4 ${status.cls}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/60">
            <span className="text-xl">{hostData.bussinessType === 'Homestay' ? '🏠' : '🏢'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{hostData.propertyName || hostData.nameOfBusiness}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
              <p className="text-xs font-semibold">{status.label}</p>
            </div>
          </div>
          <Link to="/host/property" className="text-xs font-semibold hover:underline shrink-0">
            Edit
          </Link>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-xl">📋</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">No listing created yet</p>
            <p className="text-xs text-amber-600 mt-0.5">Set up your property to start receiving bookings.</p>
          </div>
          <Link to="/host/property"
            className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0">
            Create Listing
          </Link>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {[
          { icon: CheckCircle,  label: 'Confirmed',  value: confirmed,        color: 'bg-success/10 text-success'   },
          { icon: DollarSign,   label: 'This Month', value: `₹${earnings}`,   color: 'bg-secondary/10 text-secondary' },
        ].map(({ icon: Icon, label, value, color }) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── My Services ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Services</h2>
            <Link to="/host/property" className="text-sm text-secondary hover:underline flex items-center gap-1">
              Edit <ChevronRight size={14} />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.length === 0 && <p className="text-sm text-gray-400 col-span-2">No services added yet.</p>}
            {services.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{s.name}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-bold text-secondary text-sm">₹{s.price}</span>
                  <span className="text-gray-400 text-xs">/{s.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Amenities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Amenities</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {amenities.length === 0 && <p className="text-sm text-gray-400">No amenities added yet.</p>}
              {amenities.map((a) => (
                <span key={a} className="flex items-center gap-1.5 text-xs bg-secondary/5 text-secondary px-3 py-1.5 rounded-xl font-medium border border-secondary/15">
                  <span>{AMENITY_ICONS[a] || '✓'}</span>
                  {AMENITY_LABELS[a] || a}
                </span>
              ))}
            </div>
          </div>

          {/* Pets accepted */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Pets Accepted</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {pets.length === 0 && <p className="text-sm text-gray-400">No pets added yet.</p>}
              {pets.map((p) => (
                <span key={p} className="flex items-center gap-1.5 text-sm bg-primary/10 text-yellow-700 font-semibold px-4 py-2 rounded-xl">
                  <PawPrint size={14} />
                  {p}
                </span>
              ))}
            </div>
          </div>


        </div>
      </div>

      {/* Holiday / hide-profile modal */}
      {holidayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !savingHoliday && setHolidayOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <EyeOff size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hide your profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose the dates you'll be unavailable. Your listing stays hidden during this period.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">From <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={fromDate}
                    min={todayStr}
                    onChange={(e) => {
                      setFromDate(e.target.value)
                      if (toDate && toDate < e.target.value) setToDate('')
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">To <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || todayStr}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Reason <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <textarea
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Out of town / property maintenance…"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setHolidayOpen(false)}
                disabled={savingHoliday}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitHoliday}
                disabled={savingHoliday}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {savingHoliday
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Hiding…</>
                  : <><EyeOff size={15} />Hide Profile</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
