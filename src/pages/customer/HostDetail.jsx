import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { normalizeHost } from '../../utils/normalizeHost'
import Avatar from '../../components/Avatar'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, MapPin, Star, CheckCircle, ChevronRight,
  Dog, Cat, Bird, Camera, Shield, Clock, BadgeCheck,
  Home, Building2, Ruler, Users, DoorOpen, ScrollText,
  Briefcase, Sparkles, Award,
} from 'lucide-react'

const PET_TAB_CONFIG = {
  dogs:  { label: 'Dog',       emoji: '🐕', priceKeys: ['dogSmall', 'dogMedium', 'dogLarge'] },
  cats:  { label: 'Cat',       emoji: '🐈', priceKeys: ['cat']   },
  birds: { label: 'Bird',      emoji: '🦜', priceKeys: ['bird']  },
  small: { label: 'Small Pet', emoji: '🐹', priceKeys: ['small'] },
}

const DOG_SIZE_LABELS = {
  dogSmall:  { label: 'Small',  range: '< 18 kg'   },
  dogMedium: { label: 'Medium', range: '18–45 kg'  },
  dogLarge:  { label: 'Large',  range: '> 46 kg'   },
}

const OTHER_PET_LABELS = {
  cat:   { label: 'Cat Boarding',       emoji: '🐈' },
  bird:  { label: 'Bird Boarding',      emoji: '🦜' },
  small: { label: 'Small Pet Boarding', emoji: '🐹' },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_GRADIENTS = [
  'from-violet-600 to-indigo-800',
  'from-blue-500 to-cyan-700',
  'from-emerald-600 to-teal-800',
  'from-orange-500 to-amber-700',
  'from-pink-500 to-rose-700',
  'from-secondary to-blue-900',
  'from-purple-600 to-fuchsia-800',
  'from-red-500 to-orange-700',
  'from-teal-500 to-green-700',
  'from-yellow-500 to-amber-700',
]

const BADGE_STYLE = {
  'Premium Stay': 'bg-primary text-gray-900',
  'Verified':     'bg-green-500 text-white',
  'New Star':     'bg-secondary text-white',
  'Most Popular': 'bg-orange-500 text-white',
}

const AMENITY_ICONS = {
  Grooming:             '✂️',
  Swimming:             '🏊',
  CCTV:                 '📷',
  'Vet Care':           '🏥',
  'Play Area':          '🎾',
  'Pick & Drop':        '🚗',
  'AC Rooms':           '❄️',
  'Home-cooked Meals':  '🍽️',
  '24x7 Monitoring':    '👁️',
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" style={{ width: size, height: size }}
          className={i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Fact (small labelled value) ───────────────────────────────────────────────

function Fact({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  )
}

// ─── Photo Grid ───────────────────────────────────────────────────────────────

function PhotoGrid({ photos, name }) {
  const [active, setActive] = useState(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="aspect-[4/3] overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <img
              src={src}
              alt={`${name} photo ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={photos[active]} alt="" className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setActive(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-gray-700 hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="flex justify-center gap-2 mt-3">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [host,           setHost]           = useState(location.state?.host || null)
  const [loading,        setLoading]        = useState(true)
  const [selectedPetKey, setSelectedPetKey] = useState('dogs')

  useEffect(() => {
    let cancelled = false

    const applyHost = (h) => {
      if (cancelled || !h) return false
      setHost(h)
      const keys = h.pets.filter(p => PET_TAB_CONFIG[p])
      if (keys.length) setSelectedPetKey(keys[0])
      return true
    }

    const load = async () => {
      const token = localStorage.getItem('token')
      // 1) Preferred: full detail from get-by-id (needs auth on the backend).
      try {
        const res = await axios.get(
          `/api/host/get/${id}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        )
        // The get-by-id endpoint may wrap the host under `data`; unwrap it so
        // badge/status fields (topRated, mostPopullar, …) aren't lost.
        if (applyHost(normalizeHost(res.data?.data || res.data))) return
      } catch {
        // get-by-id failed (e.g. 401 for signed-out visitors — the route is
        // auth-protected). Fall through to public sources below.
      }

      // 2) Data passed via navigation state from the listing card.
      if (applyHost(location.state?.host)) return

      // 3) Last resort: pull the host out of the public list endpoint so the
      //    page still renders on refresh / direct link without a token.
      try {
        const res = await axios.get('/api/host/get')
        const list = Array.isArray(res.data) ? res.data : res.data?.hosts || res.data?.data || []
        const match = list.map(normalizeHost).find(h => String(h.id) === String(id))
        if (applyHost(match)) return
      } catch {
        // ignore — nothing else to try
      }

      if (!cancelled) setHost(null)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    load().finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (host) {
      const keys = host.pets.filter(p => PET_TAB_CONFIG[p])
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (keys.length) setSelectedPetKey(keys[0])
    }
  }, [host])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  )

  if (!host) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Host not found</h2>
        <button onClick={() => navigate('/hosts')} className="text-secondary font-semibold hover:underline">
          ← Back to Browse
        </button>
      </div>
    )
  }

  const gradient = CARD_GRADIENTS[String(host.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0) % CARD_GRADIENTS.length]
  const avgRating = host.reviews.length ? host.reviews.reduce((s, r) => s + r.rating, 0) / host.reviews.length : 0

  const availablePetKeys = host.pets.filter((p) => PET_TAB_CONFIG[p])

  // Build active badges from the admin-managed flags on the host record.
  const activeBadges = []
  if (host.topRated) activeBadges.push({ label: 'Premium Stay', cls: BADGE_STYLE['Premium Stay'] })
  if (host.mostPopular) activeBadges.push({ label: 'Most Popular', cls: BADGE_STYLE['Most Popular'] })
  if (activeBadges.length === 0 && host.badge && BADGE_STYLE[host.badge]) {
    activeBadges.push({ label: host.badge, cls: BADGE_STYLE[host.badge] })
  }

  const selectedTab = PET_TAB_CONFIG[selectedPetKey] || PET_TAB_CONFIG[availablePetKeys[0]]
  const pricing = host.pricing || {}
  const displayPrice = selectedTab?.priceKeys
    .map((k) => pricing[k])
    .filter(Boolean)[0] ?? host.price

  // Property / business facts — only the ones the API actually returned.
  const propertyDetails = [
    { icon: Briefcase, label: 'Business Name',  value: host.businessName },
    { icon: Home,      label: 'Stay Type',  value: host.businessTypeLabel },
    { icon: Building2, label: 'Property Type',  value: host.propertyType },
    { icon: Ruler,     label: 'Property Area',  value: host.propertyAreaSize != null ? `${host.propertyAreaSize} sq.ft` : '' },
    { icon: Users,     label: 'Caretakers',     value: host.numberOfCareTakers != null ? String(host.numberOfCareTakers) : '' },
    { icon: DoorOpen,  label: 'Max Stay',       value: host.limitationsForGuests != null ? `${host.limitationsForGuests} days` : '' },
    { icon: MapPin,    label: 'Area',        value: host.area || host.city },
  ].filter(d => d.value)

  return (
    <div className="bg-gray-50 min-h-full">
      {/* ── Back bar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-secondary font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to Browse
        </button>
      </div>

      {/* ── Hero ── */}
      <div className={`bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          <Avatar
            name={host.businessName || host.ownerName || host.name}
            src={host.avatar}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white/60 shadow-xl text-3xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{host.name}</h1>
              {host.physicalVerified && (
                <BadgeCheck size={22} className="text-white drop-shadow" title="Physically Verified by House of boarding" />
              )}
              {host.status === 'verified' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500 text-white flex items-center gap-1">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
              {activeBadges.map(b => (
                <span key={b.label} className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.cls}`}>
                  {b.label}
                </span>
              ))}
              {!host.available && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
                  Fully Booked
                </span>
              )}
            </div>
            {/* {host.ownerName && (
              <p className="text-white/70 text-sm mb-1">{host.ownerName}</p>
            )} */}
            <div className="flex items-center gap-1.5 text-white/75 text-sm mb-2">
              <MapPin size={14} />
              {host.location}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Stars rating={host.rating} size={16} />
                <span className="text-white font-bold">{host.rating}</span>
                <span className="text-white/60 text-sm">({host.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/70">
                {host.pets.includes('dogs')  && <span className="flex items-center gap-1"><Dog  size={14} /> Dogs</span>}
                {host.pets.includes('cats')  && <span className="flex items-center gap-1"><Cat  size={14} /> Cats</span>}
                {host.pets.includes('birds') && <span className="flex items-center gap-1"><Bird size={14} /> Birds</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-3">About {host.name.split(' ')[0]}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{host.bio}</p>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: Camera, label: 'Real time photo/videos',  color: 'text-yellow-600 bg-yellow-50' },
                { icon: Clock,  label: '24/7 Availability',   color: 'text-green-600 bg-green-50' },
                { icon: Shield, label: 'KYC verified', color: 'text-secondary bg-secondary/10' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Property Details */}
          {propertyDetails.length > 0 && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-secondary" /> Property Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propertyDetails.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services Offered */}
          {host.serviceTypes.length > 0 && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-secondary" /> Services Offered
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {host.serviceTypes.map((s) => (
                  <span key={s} className="flex items-center gap-2 text-sm bg-primary/10 text-gray-800 px-3 py-2 rounded-xl font-semibold border border-primary/20">
                    <CheckCircle size={15} className="text-secondary" />
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Capacity & Facilities */}
          {host.facilities.length > 0 && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Capacity &amp; Facilities</h2>
              <div className="space-y-3">
                {host.facilities.map((f) => (
                  <div key={f.petType} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{f.emoji}</span>
                      <h3 className="font-bold text-gray-800 text-sm">{f.label}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {f.capacity != null && <Fact label="Capacity / day" value={f.capacity} />}
                      {f.rooms    != null && <Fact label="Rooms"          value={f.rooms} />}
                      {f.cages    != null && <Fact label="Cages"          value={f.cages} />}
                      {f.roomArea != null && <Fact label="Room Area"      value={`${f.roomArea} sq.ft`} />}
                      {f.cageDims          && <Fact label="Cage Size (L×B×H)" value={f.cageDims} />}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2.5">
              {host.amenities.map((a) => (
                <span key={a} className="flex items-center gap-2 text-sm bg-secondary/5 text-secondary px-3 py-2 rounded-xl font-medium border border-secondary/15">
                  <span>{AMENITY_ICONS[a] || '✓'}</span>
                  {a}
                </span>
              ))}
            </div>
          </section>

          {/* Paid Add-ons */}
          {host.paidAmenities.length > 0 && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-500" /> Paid Add-ons
              </h2>
              <div className="space-y-2.5">
                {host.paidAmenities.map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{p.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        {p.info && <p className="text-xs text-gray-500">{p.info}</p>}
                      </div>
                    </div>
                    <span className="font-bold text-secondary text-sm whitespace-nowrap">+₹{p.price}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience with Pets */}
          {host.experience && host.experience !== host.bio && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <Award size={18} className="text-secondary" /> Experience with Pets
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{host.experience}</p>
            </section>
          )}

          {/* House Rules */}
          {host.rules && (
            <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <ScrollText size={18} className="text-secondary" /> Property Rules
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{host.rules}</p>
            </section>
          )}

          {/* Photos */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              Photos
              <span className="text-gray-400 text-sm font-normal ml-2">({host.photos.length})</span>
            </h2>
            <PhotoGrid photos={host.photos} name={host.name} />
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg">
                Reviews
                <span className="text-gray-400 text-sm font-normal ml-2">({host.reviewCount})</span>
              </h2>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900 text-sm">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-xs">avg</span>
              </div>
            </div>

            <div className="space-y-5">
              {host.reviews.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-10 h-10 rounded-full bg-gray-100 shrink-0 border border-gray-200 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{r.name}</span>
                      <Stars rating={r.rating} size={12} />
                      <span className="text-gray-400 text-xs">{r.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {host.reviewCount > host.reviews.length && (
              <button className="mt-5 w-full py-2.5 text-sm text-secondary font-semibold border border-secondary/30 rounded-xl hover:bg-secondary/5 transition-colors">
                View all {host.reviewCount} reviews
              </button>
            )}
          </section>
        </div>

        {/* ── Right column: Pricing & Booking ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-16 space-y-4">

            {/* Pricing card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-gray-900">₹{displayPrice}</span>
                <span className="text-gray-400 text-sm">/night</span>
                <span className="ml-auto text-xs text-gray-400">{host.priceRange}</span>
              </div>

              <h3 className="font-bold text-gray-800 text-sm mb-3">Services & Pricing</h3>

              {/* Pet type tabs */}
              {availablePetKeys.length > 1 && (
                <div className="flex gap-1.5 mb-3 p-1 bg-gray-100 rounded-xl">
                  {availablePetKeys.map((petKey) => {
                    const tab = PET_TAB_CONFIG[petKey]
                    const isActive = selectedPetKey === petKey
                    return (
                      <button
                        key={petKey}
                        onClick={() => setSelectedPetKey(petKey)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <span>{tab.emoji}</span>
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Dog: size-based pricing */}
              {selectedPetKey === 'dogs' && (
                <div className="space-y-2">
                  {selectedTab.priceKeys.map((key) => {
                    const price = pricing[key]
                    if (!price) return null
                    const { label, range } = DOG_SIZE_LABELS[key]
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{range}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-secondary text-sm">₹{price}</span>
                          <span className="text-gray-400 text-xs">/night</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Cat / Bird / Small: single price */}
              {selectedPetKey !== 'dogs' && (
                <div className="space-y-2">
                  {selectedTab.priceKeys.map((key) => {
                    const price = pricing[key]
                    if (!price) return null
                    const { label, emoji } = OTHER_PET_LABELS[key] || {}
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{emoji}</span>
                          <span className="text-sm font-semibold text-gray-800">{label}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-secondary text-sm">₹{price}</span>
                          <span className="text-gray-400 text-xs">/night</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {(() => {
                // Hosts and admins can browse listings but cannot book — booking
                // is a customer-only action.
                const isHost = user?.role === 'host'
                const isAdmin = user?.role === 'admin'
                const cannotBook = isHost || isAdmin
                const canBook = host.available && !cannotBook
                return (
                  <>
                    <button
                      disabled={!canBook}
                      onClick={() => {
                        if (!canBook) return
                        if (!user) {
                          // Send guests to login, then back to this host page to finish booking.
                          const from = `/hosts/${host.id}`
                          localStorage.setItem('postLoginRedirect', from)
                          navigate('/login', { state: { from } })
                        } else {
                          navigate('/book', { state: { host } })
                        }
                      }}
                      className={`mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-colors ${
                        canBook
                          ? 'bg-primary text-gray-900 hover:bg-yellow-400 shadow-sm cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isHost ? (
                        'Booking not available for hosts'
                      ) : isAdmin ? (
                        'Booking not available for admins'
                      ) : host.available ? (
                        <><ChevronRight size={16} /> Book Now</>
                      ) : (
                        'Currently Unavailable'
                      )}
                    </button>

                    {cannotBook ? (
                      <p className="text-center text-xs text-gray-400 mt-2">
                        You're signed in as {isHost ? 'a host' : 'an admin'}. Switch to a customer account to book.
                      </p>
                    ) : host.available ? (
                      <p className="text-center text-xs text-gray-400 mt-2">90% refund, if cancelled before 24h of check in</p>
                    ) : null}
                  </>
                )
              })()}
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              {/* <h3 className="font-bold text-gray-800 text-sm mb-3">Safety Guarantees</h3> */}
              <div className="space-y-2.5">
                {[
                  { icon: Clock,        text: 'Check-in 12 PM - Check-out 10 AM' },
                  { icon: Shield,       text: 'Documentation compulsory at property' },
                  { icon: CheckCircle,  text: 'Hassle free check in process' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Icon size={15} className="text-green-500 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
