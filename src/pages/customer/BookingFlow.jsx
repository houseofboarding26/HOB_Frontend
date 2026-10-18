import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import Avatar from '../../components/Avatar'
import RazorpayPayment from '../../components/RazorpayPayment'
import { useAuth } from '../../context/AuthContext'
import { AMENITY_KEY } from '../../utils/normalizeHost'
import { EMERGENCY_BOARDING_PRICE } from '../../config/pricing'
import { mockCustomerBookings } from '../../mock/data'
import {
  ChevronRight, ChevronLeft, CheckCircle,
  ShieldCheck, MapPin, Star, Printer, FileText, X,
} from 'lucide-react'

const STEPS = ['Stay Details', 'Checkout']

const BOOKING_TYPES = ['Single Day', 'Multi-day', 'Emergency']

// Flat surcharge added to the total when an Emergency booking is chosen.
// Shared with the host dashboard via the central pricing config.
const EMERGENCY_FEE = EMERGENCY_BOARDING_PRICE

// Platform fee AND GST are both charged on the boarding subtotal (booking +
// amenities + emergency, i.e. everything except the optional cancellation
// protection). Neither is charged on the platform fee itself.
const PLATFORM_FEE_RATE = 0.06
const GST_RATE = 0.18

// Money formatter for display: whole amounts show no decimals, fractional ones
// show exactly 2 — so the exact calculated figure (e.g. ₹578.28) renders instead
// of a rounded whole rupee.
const money = (n) => {
  const num = Number(n || 0)
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

// UI label → backend bookingType enum.
const BOOKING_TYPE_API = { 'Single Day': 'daily', 'Multi-day': 'multidays', Emergency: 'hourly' }

// Full text of the mandatory Pet Health & Behaviour Declaration. Shown in a
// popup (the checkbox next to the summary keeps the booking form compact) and
// its acceptance is sent to the booking API.
const DECLARATION_PARAGRAPHS = [
  'By submitting this declaration, I confirm and declare that all information provided regarding my pet’s health, vaccination status, medical history, tick/flea status, and behaviour is true, complete, accurate, and current as of the date of this booking.',
  'I further confirm that I have reviewed and updated this information specifically for the current booking. If there have been no changes since my previous booking or declaration, I confirm that the information previously provided remains accurate and unchanged.',
  'I agree to promptly notify the Hospitality Partner of any change in my pet’s health, injury, illness, vaccination status, tick/flea condition, or behaviour occurring between the date of booking and the check-in date.',
  'I understand that failure to disclose or update any relevant information may affect the Hospitality Partner’s ability to provide appropriate care and may impact the acceptance or continuation of my pet’s booking.',
]

// Per-night price for a single pet based on its type and (for dogs) size,
// using the host's pricing map from normalizeHost.
function petNightlyPrice(pet, pricing = {}) {
  const type = (pet.species || '').toLowerCase()
  const size = (pet.size || '').toLowerCase()
  if (type === 'dog') {
    if (size === 'large')  return pricing.dogLarge  ?? pricing.dogMedium ?? pricing.dogSmall  ?? 0
    if (size === 'medium') return pricing.dogMedium ?? pricing.dogSmall  ?? pricing.dogLarge  ?? 0
    return pricing.dogSmall ?? pricing.dogMedium ?? pricing.dogLarge ?? 0   // small / unspecified
  }
  if (type === 'cat')  return pricing.cat  ?? 0
  if (type === 'bird') return pricing.bird ?? 0
  return pricing.small ?? 0   // smallPet / anything else
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <CheckCircle size={17} /> : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-semibold ${i === step ? 'text-secondary' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function BookingFlow() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const host = state?.host

  const [pets, setPets] = useState([])
  const [loadingPets, setLoadingPets] = useState(true)
  const [step, setStep] = useState(0)
  const [selectedPets, setSelectedPets] = useState([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [bookingType, setBookingType] = useState('Multi-day')
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState(false)
  const [healthDeclaration, setHealthDeclaration] = useState(false)
  const [showDeclaration, setShowDeclaration] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [bookingError, setBookingError] = useState(false)
  const [holidayRanges, setHolidayRanges] = useState([])
  const [dateError, setDateError] = useState('')
  // Guards against creating duplicate bookings from double-clicks or going back
  // to the details step and continuing again.
  const creatingRef = useRef(false)

  // Local YYYY-MM-DD for today — used as the min for date pickers so no past
  // date can be selected.
  const today = new Date().toLocaleDateString('en-CA')

  // Load this customer's saved pet profiles from the API.
  useEffect(() => {
    const userId = user?.id
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setLoadingPets(false); return }
    let cancelled = false
    const token = localStorage.getItem('token')
    axios.get('/api/petProfile/get', {
      params: { userId },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
        setPets(list.map((p) => ({ id: p.id, name: p.petName, species: p.petType, size: p.petSize })))
      })
      .catch(() => { if (!cancelled) setPets([]) })
      .finally(() => { if (!cancelled) setLoadingPets(false) })
    return () => { cancelled = true }
  }, [user?.id])

  // Fetch this host's holidays so booked-out dates can be blocked.
  // GET /api/host/holiday/get/:hostId returns the host's holiday — may be a
  // single object or an array depending on how many holidays exist.
  useEffect(() => {
    if (!host?.id) return
    let cancelled = false

    // No auth header — holiday availability is public info.
    // Sending a customer token causes 403 because the endpoint checks host role.
    axios.get(`/api/host/holiday/get/${host.id}`)
      .then((res) => {
        if (cancelled) return
        const raw = res.data?.data ?? res.data
        // API may return a single object or an array — normalise to array.
        const list = Array.isArray(raw) ? raw : raw && raw.id ? [raw] : []
        setHolidayRanges(list.map((h) => ({
          from: (h.fromDate || '').slice(0, 10),
          to:   (h.toDate   || '').slice(0, 10),
        })))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [host?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // True if the booking range [from, to] overlaps any holiday range.
  const overlapsHoliday = (from, to) =>
    holidayRanges.some((r) => r.from && r.to && from <= r.to && to >= r.from)

  // Booking type is derived from the chosen dates, not picked manually:
  //   check-in is today (same day as booking) → Emergency (any check-out)
  //   future check-in, 0–1 night              → Single Day
  //   future check-in, 2+ nights              → Multi-day
  // Check-out stays editable so the user can always extend to a later date.
  useEffect(() => {
    if (!checkIn || !checkOut) return
    const n = Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000)
    const derived =
      checkIn === today ? 'Emergency'
      : n >= 2 ? 'Multi-day'
      : 'Single Day'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (bookingType !== derived) setBookingType(derived)
  }, [checkIn, checkOut, today]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset cancellation protection when check-in is today (same-day = non-refundable).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (checkIn === today) setCancellationPolicy(false)
  }, [checkIn, today])

  useEffect(() => {
    if (!host) navigate('/hosts', { replace: true })
  }, [host, navigate])

  if (!host) return null

  const isEmergency = bookingType === 'Emergency'

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000))
      : 0

  // The pets this customer picked (each carries type + size for pricing).
  const selectedPetObjs = pets.filter((p) => selectedPets.includes(p.id))

  // Price is per pet, by type/size. Charge per night when the stay spans one or
  // more nights (Multi-day, or a same-day Emergency that runs several nights),
  // otherwise a single day. Each pet's nightly rate comes from the host's pricing.
  const chargeableDays = Math.max(1, nights)
  const baseTotal = selectedPetObjs.reduce(
    (sum, p) => sum + petNightlyPrice(p, host.pricing) * chargeableDays,
    0,
  )

  // Emergency bookings carry a flat surcharge on top of the day price. Use the
  // host's own price when the backend provides it, else the config default.
  const emergencyFee = isEmergency ? (host.emergencyBoardingPrice ?? EMERGENCY_FEE) : 0

  // Paid amenities offered by this specific host (from the API via
  // normalizeHost). Customers can opt into any of these; their prices are
  // added on top of the boarding amount.
  const hostAmenities = host.paidAmenities || []
  const selectedAmenityObjs = hostAmenities.filter((a) => selectedAmenities.includes(a.name))
  const amenitiesTotal = selectedAmenityObjs.reduce((sum, a) => sum + (Number(a.price) || 0), 0)

  // ── New pricing structure ────────────────────────────────────────────────
  // bookingSubtotal  = baseFare + add-ons + emergency
  // platformFee      = 6% of bookingSubtotal (charged to customer)
  // hostCommission   = 6% of (baseFare + add-ons)  — internal, not shown
  // protectionFee    = 10% of (baseFare + add-ons + platformFee)
  // gst              = 18% of (platformFee + hostCommission + protectionFee if selected)
  // platformAndTaxes = platformFee + gst  (single customer-facing line)
  // total            = bookingSubtotal + protectionFee (if selected) + platformAndTaxes

  // Keep the exact calculated amounts (to paise) instead of rounding to whole
  // rupees, so the breakdown shows the real figures (e.g. ₹578.28, not ₹578).
  const round2 = (n) => Math.round(n * 100) / 100
  const bookingSubtotal = round2(baseTotal + amenitiesTotal + emergencyFee)
  const platformFee     = round2(bookingSubtotal * PLATFORM_FEE_RATE)
  const hostCommission  = round2((baseTotal + amenitiesTotal) * PLATFORM_FEE_RATE)
  const protectionFee   = round2((baseTotal + amenitiesTotal + platformFee) * 0.1)
  const appliedProtection = cancellationPolicy ? protectionFee : 0
  const gst             = round2((platformFee + hostCommission + appliedProtection) * GST_RATE)
  const platformAndTaxes = round2(platformFee + gst)

  const total = round2(bookingSubtotal + appliedProtection + platformAndTaxes)

  // Creates the booking via the API and stores the returned booking id. The
  // Checkout button stays disabled until this succeeds and an id comes back.
  const createBooking = async () => {
    // Don't create another booking if one already exists (back → continue again)
    // or if a create is already in flight (rapid double-click).
    if (bookingId || creatingRef.current) return
    creatingRef.current = true
    setProcessing(true)
    setBookingError(false)
    try {
      const token = localStorage.getItem('token')
      const payload = {
        hostId: host.id,
        petIds: selectedPets,
        // Daily → "daily", Multi-day → "multidays", Emergency → "hourly".
        bookingType: BOOKING_TYPE_API[bookingType] || 'daily',
        checkIn: new Date(checkIn).toISOString(),
        // The backend requires checkOut strictly after checkIn. Single-day
        // bookings (0 nights — Emergency, or same-day Daily) send the next day.
        checkOut: (() => {
          const sameDay = nights <= 0
          const out = new Date(sameDay ? checkIn : checkOut)
          if (sameDay) out.setDate(out.getDate() + 1)
          return out.toISOString()
        })(),
        cancellationProtection: Boolean(cancellationPolicy),
        // Customer accepted the Pet Health & Behaviour Declaration (mandatory).
        healthDeclaration: Boolean(healthDeclaration),
        instructions: specialInstructions,
        // Backend expects the enum key (e.g. "swimming"), not the display label.
        amenities: selectedAmenityObjs.map((a) => ({
          amenity: a.key || AMENITY_KEY[a.name] || a.name,
          price: Number(a.price) || 0,
        })),
        amountSummary: {
          baseFare: baseTotal,
          addOns: selectedAmenityObjs.map((a) => ({ name: a.name, price: Number(a.price) || 0 })),
          addOnsTotal: amenitiesTotal,
          emergencyCharge: emergencyFee,
          bookingSubtotal,
          platformFee,
          hostCommission,
          cancellationProtection: appliedProtection,
          gst,
          platformAndTaxes,
          totalAmount: total,
        },
      }
      const res = await axios.post('/api/bookings/add', payload, {
        params: { userId: user?.id },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      // eslint-disable-next-line react-hooks/purity
      const newId = res.data?.id || res.data?.data?.id || res.data?.bookingId || `HOB-${Date.now().toString().slice(-6)}`

      // Mirror into the local list so the customer's bookings page reflects it immediately.
      mockCustomerBookings.push({
        id: mockCustomerBookings.length + 1,
        hostName: host.name,
        petName: selectedPetObjs.map((p) => p.name).join(', ') || 'Your Pet',
        checkIn,
        checkOut,
        status: 'confirmed',
        total,
        service: `${bookingType} Boarding`,
        paidAmenities: selectedAmenityObjs.map((a) => ({ name: a.name, price: Number(a.price) || 0 })),
        bookedAt: new Date().toISOString(),
        hasCancellationPolicy: cancellationPolicy,
        cancellationPolicyFee: cancellationPolicy ? protectionFee : 0,
        platformFee,
        gst,
      })
      setBookingId(newId)
      return newId
    } catch (err) {
      setBookingError(true)
      const errData = err.response?.data
      const msg = errData?.message || errData?.error || errData?.msg
      toast.error(typeof msg === 'string' ? msg : 'Booking failed. Please try again.', { duration: 6000 })
      throw err
    } finally {
      creatingRef.current = false
      setProcessing(false)
    }
  }

  const togglePet = (id) =>
    setSelectedPets((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleAmenity = (name) =>
    setSelectedAmenities((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])

  // Opens a clean, itemised receipt in a new window and triggers the browser's
  // print dialog. Self-contained so the app's chrome (navbar etc.) isn't printed.
  const printReceipt = () => {
    const fmt = (n) => `₹${money(n)}`
    const petRows = selectedPetObjs.map((p) => {
      const rate = petNightlyPrice(p, host.pricing)
      const isDog = (p.species || '').toLowerCase() === 'dog'
      const label = isDog && p.size ? `${p.size} ${p.species}` : p.species
      const qty = chargeableDays > 1 ? ` × ${chargeableDays} nights` : ''
      return [`${p.name} (${label}) · ${fmt(rate)}${qty}`, fmt(rate * chargeableDays)]
    })
    const items = [
      ...petRows,
      ['Booking Amount', fmt(baseTotal)],
      ...selectedAmenityObjs.map((a) => [`${a.name} (Add-on)`, `+${fmt(Number(a.price) || 0)}`]),
      ...(emergencyFee > 0 ? [['Emergency Charge', `+${fmt(emergencyFee)}`]] : []),
      ['Booking Subtotal', fmt(bookingSubtotal)],
      ...(appliedProtection > 0 ? [['Cancellation Protection', `+${fmt(appliedProtection)}`]] : []),
      ['Platform & Taxes', `+${fmt(platformAndTaxes)}`],
    ]
    const rowsHtml = items
      .map(([l, v]) => `<tr><td>${l}</td><td class="amt">${v}</td></tr>`)
      .join('')
    const meta = [
      ['Booking ID', bookingId || '—'],
      ['Host', host.name],
      ['Pet(s)', selectedPetObjs.map((p) => p.name).join(', ') || '—'],
      ['Check-in', checkIn || '—'],
      ['Check-out', checkOut || '—'],
      ['Booking Type', bookingType],
    ].map(([l, v]) => `<tr><td>${l}</td><td class="amt">${v}</td></tr>`).join('')

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${bookingId || ''}</title>
      <style>
        *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}
        body{margin:0;padding:24px;color:#1f2937}
        .brand{font-size:20px;font-weight:800;color:#2d6be4;margin-bottom:2px}
        .sub{font-size:12px;color:#6b7280;margin-bottom:18px}
        h2{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:18px 0 6px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        td{padding:6px 0;border-bottom:1px solid #f0f0f0}
        td.amt{text-align:right;font-weight:600;white-space:nowrap}
        .total td{border-top:2px solid #111;border-bottom:none;padding-top:10px;font-size:16px;font-weight:800}
        .total td.amt{color:#2d6be4}
        .foot{margin-top:20px;font-size:11px;color:#9ca3af;text-align:center}
      </style></head><body>
      <div class="brand">House of boarding</div>
      <div class="sub">Payment Receipt</div>
      <table>${meta}</table>
      <h2>Charges</h2>
      <table>${rowsHtml}
        <tr class="total"><td>Total Paid</td><td class="amt">${fmt(total)}</td></tr>
      </table>
      <div class="foot">Thank you for booking with House of boarding · This is a computer-generated receipt.</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>`

    const w = window.open('', '_blank', 'width=460,height=680')
    if (!w) { toast.error('Please allow pop-ups to print your receipt.'); return }
    w.document.write(html)
    w.document.close()
  }

  // ─── Booking confirmed ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 mt-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={42} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-1">
            Booking ID: <span className="font-bold text-secondary">{bookingId}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your booking with <strong>{host.name}</strong> is confirmed. You'll receive updates shortly.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 space-y-2.5">
            {[
              ['Host', host.name],
              ['Pet(s)', selectedPetObjs.length ? selectedPetObjs.map((p) => p.name).join(', ') : '—'],
              ['Check-in', checkIn || '—'],
              ['Check-out', checkOut || '—'],
              ['Booking Type', bookingType],
              ...(selectedAmenityObjs.length ? [['Paid Amenities', selectedAmenityObjs.map((a) => a.name).join(', ')]] : []),
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">{val}</span>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-2.5 space-y-2.5">
              {[
                ['Base Fare', `₹${baseTotal.toLocaleString('en-IN')}`],
                ...(amenitiesTotal > 0 ? [['Add-ons', `+₹${amenitiesTotal.toLocaleString('en-IN')}`]] : []),
                ...(emergencyFee > 0 ? [['Emergency Charge', `+₹${emergencyFee.toLocaleString('en-IN')}`]] : []),
                ['Booking Subtotal', `₹${bookingSubtotal.toLocaleString('en-IN')}`],
                ...(appliedProtection > 0 ? [['Cancellation Protection', `+₹${money(appliedProtection)}`]] : []),
                ['Platform & Taxes', `+₹${money(platformAndTaxes)}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{val}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t border-gray-300 pt-2.5">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-bold text-secondary">₹{money(total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={printReceipt}
            className="w-full flex items-center justify-center gap-2 py-3 mb-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Printer size={17} /> Print Receipt
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/hosts')}
              className="flex-1 py-3 border-2 border-secondary text-secondary font-bold rounded-xl hover:bg-secondary/5 transition-colors"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Book a Stay</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          with <strong>{host.name}</strong> in {host.city}
        </p>
      </div>

      <StepIndicator step={step} />

      {/* ─── Step 1: Stay Details ───────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Host card */}
          <div className="flex items-center gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
            <Avatar
              name={host.name}
              src={host.avatar}
              className="w-14 h-14 rounded-xl border-2 border-white shadow-sm text-base shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{host.name}</p>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                <MapPin size={11} /> {host.location}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-gray-700">{host.rating}</span>
                <span className="text-xs text-gray-400">· ₹{host.price}/night</span>
              </div>
            </div>
            {host.badge && (
              <span className="text-xs bg-secondary text-white px-2.5 py-1 rounded-full font-bold shrink-0">
                {host.badge}
              </span>
            )}
          </div>

          {/* Pet selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Your Pet(s) <span className="text-red-400">*</span>
            </label>
            {loadingPets ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <span className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                Loading your pets…
              </div>
            ) : pets.length === 0 ? (
              // First-time customer with no saved pets — prompt to create one.
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-500 mb-3">You don’t have any pet profiles yet.</p>
                <Link
                  to="/pet-profile"
                  state={{ from: 'booking', host }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 transition-all"
                >
                  + Add a Pet Profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pets.map((p) => {
                  const active = selectedPets.includes(p.id)
                  const SPECIES_EMOJI = { Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰' }
                  // Only pets whose species the host accepts are selectable. Host
                  // pet keys are normalized (Dog→dogs, Cat→cats, Bird→birds,
                  // smallPet→small). If the host lists no pet types, allow all.
                  const SPECIES_HOST_KEY = { dog: 'dogs', cat: 'cats', bird: 'birds', smallpet: 'small' }
                  const accepted =
                    !host.pets?.length ||
                    host.pets.includes(SPECIES_HOST_KEY[(p.species || '').toLowerCase()])
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!accepted}
                      title={accepted ? undefined : `This host does not accept ${p.species} pets`}
                      onClick={() => { if (accepted) togglePet(p.id) }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all select-none ${
                        !accepted
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : active
                          ? 'border-secondary bg-secondary text-white'
                          : 'border-gray-200 text-gray-700 hover:border-secondary/50'
                      }`}
                    >
                      <span className={accepted ? '' : 'opacity-40'}>{SPECIES_EMOJI[p.species] || '🐾'}</span>
                      <span>{p.name}</span>
                      <span className={`text-xs ${!accepted ? 'text-gray-300' : active ? 'text-white/70' : 'text-gray-400'}`}>
                        {accepted ? p.species : `${p.species} · not accepted`}
                      </span>
                    </button>
                  )
                })}
                {/* Add another pet profile */}
                <Link
                  to="/pet-profile"
                  state={{ from: 'booking', host }}
                  title="Add a pet profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-secondary hover:text-secondary transition-all select-none"
                >
                  <span className="text-lg leading-none">+</span>
                  <span>Add Pet</span>
                </Link>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Check-in <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => {
                  const v = e.target.value
                  if (v < today) { setDateError('Check-in cannot be in the past.'); return }
                  const out = (!checkOut || checkOut < v) ? v : checkOut
                  if (overlapsHoliday(v, out)) {
                    setDateError(`This host is unavailable from ${holidayRanges.find(r => v <= r.to && out >= r.from)?.from} to ${holidayRanges.find(r => v <= r.to && out >= r.from)?.to}. Please choose different dates.`)
                    setCheckIn('')
                    return
                  }
                  setDateError('')
                  setCheckIn(v)
                  if (!checkOut || checkOut < v) setCheckOut(v)
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              {isEmergency && <p className="text-xs text-gray-400 mt-1">Same-day check-in bookings are considered emergency or hourly bookings and are non-refundable.</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Check-out <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => {
                  const v = e.target.value
                  if (v < today) { setDateError('Check-out cannot be in the past.'); return }
                  const from = checkIn || today
                  if (overlapsHoliday(from, v)) {
                    setDateError(`This host is unavailable from ${holidayRanges.find(r => from <= r.to && v >= r.from)?.from} to ${holidayRanges.find(r => from <= r.to && v >= r.from)?.to}. Please choose different dates.`)
                    setCheckOut('')
                    return
                  }
                  setDateError('')
                  setCheckOut(v)
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
          </div>
          {dateError && (
            <p className="text-xs text-red-500 -mt-2">{dateError}</p>
          )}
          {holidayRanges.length > 0 && (
            <p className="text-xs text-amber-600">
              Unavailable dates: {holidayRanges.map((r) => `${r.from} – ${r.to}`).join(', ')}
            </p>
          )}

          {nights > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
              <CheckCircle size={15} className="shrink-0" />
              {nights} night{nights > 1 ? 's' : ''} selected
            </div>
          )}

          {/* Cancellation Protection Policy — hidden for same-day check-in */}
          {baseTotal > 0 && checkIn !== today && (
            <button
              type="button"
              onClick={() => setCancellationPolicy(p => !p)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                cancellationPolicy
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  cancellationPolicy ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {cancellationPolicy && <CheckCircle size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ShieldCheck size={15} className={cancellationPolicy ? 'text-green-600' : 'text-gray-400'} />
                    <span className={`text-sm font-bold ${cancellationPolicy ? 'text-green-700' : 'text-gray-700'}`}>
                      Add Cancellation Protection
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      cancellationPolicy ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      +₹{protectionFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cancel before <strong>8AM</strong> on check-in day and get <strong>100% refund</strong>. Without this, cancel within <strong>24 hours</strong> of booking and receive a 90% refund.
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Booking type — auto-derived from the selected dates */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Booking Type</label>
            <div className="flex gap-2">
              {BOOKING_TYPES.map((type) => (
                <div
                  key={type}
                  aria-current={bookingType === type}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 text-center select-none transition-all ${
                    bookingType === type
                      ? 'border-secondary bg-secondary text-white'
                      : 'border-gray-200 text-gray-400'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Set automatically: check-in today → Emergency, future 0–1 night → Single day, future 2+ nights → Multi-day.
            </p>
          </div>

          {/* Paid amenities (host-specific, from API) */}
          {hostAmenities.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Add Paid Amenities
              </label>
              <p className="text-xs text-gray-400 mb-2.5">Optional extras offered by {host.name}</p>
              <div className="space-y-2">
                {hostAmenities.map((a) => {
                  const active = selectedAmenities.includes(a.name)
                  return (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => toggleAmenity(a.name)}
                      className={`w-full flex items-center gap-3 text-left p-3 rounded-xl border-2 transition-all ${
                        active ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-secondary/50'
                      }`}
                    >
                      <span className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        active ? 'border-secondary bg-secondary' : 'border-gray-300'
                      }`}>
                        {active && <CheckCircle size={12} className="text-white" />}
                      </span>
                      <span className="text-lg shrink-0">{a.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-800">{a.name}</span>
                        {a.info && <span className="block text-xs text-gray-500 truncate">{a.info}</span>}
                      </span>
                      <span className="text-sm font-bold text-secondary shrink-0">
                        +₹{(Number(a.price) || 0).toLocaleString('en-IN')}
                      </span>
                    </button>
                  )
                })}
              </div>
              {amenitiesTotal > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Amenities subtotal: <span className="font-semibold text-gray-700">₹{amenitiesTotal.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>
          )}

          {/* Special instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
              placeholder="Any dietary needs, medications, or special requirements…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
            />
          </div>

          {/* Pet Health & Behaviour Declaration — mandatory. Kept to one line
              here; the full text opens in a popup to avoid crowding the form. */}
          <div className={`rounded-xl border-2 p-4 transition-colors ${
            healthDeclaration ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={healthDeclaration}
                onChange={(e) => setHealthDeclaration(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-green-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                I confirm my pet’s health, vaccination, medical history, tick/flea status and
                behaviour details are true, complete and up to date for this booking.{' '}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowDeclaration(true) }}
                  className="text-secondary font-semibold underline underline-offset-2 hover:text-secondary-dark"
                >
                  Read full declaration
                </button>
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedPets.length === 0) { toast.error('Please select at least one pet'); return }
              if (!checkIn || !checkOut) { toast.error('Please choose check-in and check-out dates'); return }
              if (overlapsHoliday(checkIn, checkOut)) { toast.error('Selected dates overlap with the host\'s holiday. Please choose different dates.'); return }
              if (!healthDeclaration) { toast.error('Please accept the Pet Health & Behaviour Declaration'); return }
              setStep(1)
              window.scrollTo(0, 0)
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors"
          >
            Continue to Checkout <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Step 2: Payment ─────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              {[
                ['Host', host.name],
                ['Pet(s)', selectedPetObjs.length ? selectedPetObjs.map((p) => p.name).join(', ') : '—'],
                ['Check-in', checkIn || '—'],
                ['Check-out', checkOut || '—'],
                ['Booking Type', bookingType],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
              {/* Per-pet breakdown */}
              {selectedPetObjs.map((p) => {
                const rate = petNightlyPrice(p, host.pricing)
                const isDog = (p.species || '').toLowerCase() === 'dog'
                const label = isDog && p.size ? `${p.size} ${p.species}` : p.species
                return (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-gray-500">
                      {p.name} <span className="text-gray-400">({label})</span>
                      {' '}· ₹{rate.toLocaleString('en-IN')}{chargeableDays > 1 ? ` × ${chargeableDays} nights` : ''}
                    </span>
                    <span className="font-medium text-gray-900">₹{(rate * chargeableDays).toLocaleString('en-IN')}</span>
                  </div>
                )
              })}
              {/* Base fare subtotal */}
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">Booking Amount</span>
                <span className="font-medium text-gray-900">₹{baseTotal.toLocaleString('en-IN')}</span>
              </div>
              {/* Add-ons — each shown separately */}
              {selectedAmenityObjs.map((a) => (
                <div key={a.name} className="flex justify-between">
                  <span className="text-gray-500">{a.icon} {a.name} <span className="text-gray-400 text-xs">(Add-on)</span></span>
                  <span className="font-medium text-gray-900">+₹{(Number(a.price) || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {/* Emergency charge */}
              {emergencyFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Emergency Charge</span>
                  <span className="font-medium text-gray-900">+₹{emergencyFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              {/* Booking subtotal */}
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-600 font-medium">Booking Subtotal</span>
                <span className="font-semibold text-gray-900">₹{bookingSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {/* Cancellation Protection */}
              {cancellationPolicy && (
                <div className="flex justify-between">
                  <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={13} /> Cancellation Protection</span>
                  <span className="font-medium text-green-700">+₹{money(protectionFee)}</span>
                </div>
              )}
              {/* Platform fee + GST combined */}
              <div className="flex justify-between">
                <span className="text-gray-500">Platform &amp; Taxes</span>
                <span className="font-medium text-gray-900">+₹{money(platformAndTaxes)}</span>
              </div>
              {/* Total */}
              <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-secondary">₹{money(total)}</span>
              </div>
            </div>
          </div>

          {/* Checkout — Razorpay opens only after the booking is created on Pay click */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {bookingError && (
              <div className="text-sm text-red-500 text-center mb-3">
                Couldn’t create your booking. Please try again.
              </div>
            )}
            <RazorpayPayment
              bookingId={bookingId || undefined}
              onBeforePay={!bookingId ? createBooking : undefined}
              amount={total}
              amountSummary={{
                baseFare: baseTotal,
                addOnsTotal: amenitiesTotal,
                emergencyCharge: emergencyFee,
                bookingSubtotal,
                platformFee,
                hostCommission,
                cancellationProtection: appliedProtection,
                gst,
                platformAndTaxes,
                totalAmount: total,
              }}
              userId={user?.id}
              user={{ name: user?.name, email: user?.email, phone: user?.phone || user?.contactNumber || '' }}
              disabled={processing}
              label={`Checkout · ₹${money(total)}`}
              onSuccess={() => setConfirmed(true)}
              className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${
                !processing
                  ? 'bg-secondary hover:bg-secondary-dark shadow-lg shadow-secondary/20'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              // Reset the created booking so editing details makes a fresh one.
              setBookingId(null)
              setBookingError(false)
              setStep(0)
              window.scrollTo(0, 0)
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <ChevronLeft size={15} /> Back to Stay Details
          </button>
        </div>
      )}

      {/* Pet Health & Behaviour Declaration — full text popup */}
      {showDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeclaration(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-secondary" />
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">Pet Health &amp; Behaviour Declaration</h3>
              </div>
              <button
                onClick={() => setShowDeclaration(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {DECLARATION_PARAGRAPHS.map((p, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">{p}</p>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={() => { setHealthDeclaration(true); setShowDeclaration(false) }}
                className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors"
              >
                I Read, Understood &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
