import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  normalizeHost, AMENITY_OPTIONS,
  AMENITY_KEY, PET_KEY, BUSINESS_TYPE_KEY,
} from '../../utils/normalizeHost'
import Avatar from '../../components/Avatar'
import { useAuth } from '../../context/AuthContext'
import { useBanners } from '../../context/BannerContext'
import {
  Search, MapPin, Star, SlidersHorizontal, X,
  Dog, Cat, Bird, Rabbit, ChevronRight, BadgeCheck,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

// ─── Constants ────────────────────────────────────────────────────────────────

// Full class strings here so Tailwind v4 scanner picks them all up
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

const PAGE_SIZE = 9
// Wait this long after the last filter change before hitting the API, so rapid
// clicks / typing collapse into a single request instead of one per keystroke.
const FETCH_DEBOUNCE_MS = 1200

const PET_FILTERS = [
  { id: 'dogs',  label: 'Dogs',       icon: Dog    },
  { id: 'cats',  label: 'Cats',       icon: Cat    },
  { id: 'birds', label: 'Birds',      icon: Bird   },
  { id: 'small', label: 'Small Pets', icon: Rabbit },
]

const BADGE_STYLE = {
  'Premium Stay':     'bg-primary text-gray-900',
  'Verified':     'bg-green-500 text-white',
  'New Star':     'bg-secondary text-white',
  'Most Popular': 'bg-orange-500 text-white',
}

const BUSINESS_TYPE_STYLE = {
  homestay:     { label: 'Homestay',     icon: '🏠', cls: 'bg-teal-50 text-teal-700 border border-teal-200' },
  professional: { label: 'Professional', icon: '🏢', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
}

// ─── Pet Loader ───────────────────────────────────────────────────────────────

// Playful paw-print loader used instead of a plain spinner. Three paws bounce in
// a staggered wave to read as an animal "walking in".
function PetLoader({ label = 'Fetching hosts…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      <div className="flex gap-1.5 text-3xl">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-bounce"
            style={{ animationDelay: `${i * 0.16}s`, animationDuration: '0.9s' }}
          >
            🐾
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-400 font-medium animate-pulse">{label}</p>
    </div>
  )
}

// ─── Host Card ────────────────────────────────────────────────────────────────

function HostCard({ host, onClick }) {
  const gradient = CARD_GRADIENTS[String(host.id).split('').reduce((s, c) => s + c.charCodeAt(0), 0) % CARD_GRADIENTS.length]
  const mainEmoji = host.pets.includes('dogs') ? '🐕' : host.pets.includes('cats') ? '🐈' : '🦜'

  // Build badge list from the admin-managed flags on the host record.
  const activeBadges = []
  if (host.topRated) activeBadges.push({ label: 'Premium Stay', cls: BADGE_STYLE['Premium Stay'] })
  if (host.mostPopular) activeBadges.push({ label: 'Most Popular', cls: BADGE_STYLE['Most Popular'] })
  if (activeBadges.length === 0 && host.badge && BADGE_STYLE[host.badge]) {
    activeBadges.push({ label: host.badge, cls: BADGE_STYLE[host.badge] })
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col"
    >
      {/* Banner */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        {host.coverPhoto ? (
          <img
            src={host.coverPhoto}
            alt={`${host.name} property`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl select-none opacity-80">{mainEmoji}</span>
        )}

        {activeBadges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {activeBadges.map(b => (
              <span key={b.label} className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.cls}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
        {!host.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full">Fully Booked</span>
          </div>
        )}
        <Avatar
          name={host.name}
          src={host.avatar}
          className="absolute bottom-0 right-3 translate-y-1/2 w-14 h-14 rounded-full border-4 border-white shadow-md text-base"
        />
      </div>

      {/* Body */}
      <div className="p-4 pt-9 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{host.name}</h3>
            {host.physicalVerified && (
              <BadgeCheck size={16} className="text-secondary shrink-0" title="Physically Verified" />
            )}
          </div>
          <span className="font-bold text-secondary text-sm whitespace-nowrap shrink-0">
            {host.startingPrice > 0 ? `₹${host.startingPrice}` : 'View Profile'}<span className="text-gray-400 font-normal text-xs">{host.startingPrice > 0 ? '/night' : ''}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-gray-500 text-xs min-w-0">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{host.location}</span>
          </div>
          {host.businessType && BUSINESS_TYPE_STYLE[host.businessType] && (
            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${BUSINESS_TYPE_STYLE[host.businessType].cls}`}>
              <span>{BUSINESS_TYPE_STYLE[host.businessType].icon}</span>
              {BUSINESS_TYPE_STYLE[host.businessType].label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Star size={13} className="fill-yellow-400 text-yellow-400 shrink-0" />
          <span className="font-bold text-gray-800 text-sm">{host.rating}</span>
          <span className="text-gray-400 text-xs">({host.reviewCount} reviews)</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {host.serviceTypes.map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1 text-lg">
            {host.pets.includes('dogs')  && <span title="Dogs">🐕</span>}
            {host.pets.includes('cats')  && <span title="Cats">🐈</span>}
            {host.pets.includes('birds') && <span title="Birds">🦜</span>}
            {host.pets.includes('small') && <span title="Small Pets">🐹</span>}
          </div>
          <button className="flex items-center gap-1 text-xs text-secondary font-semibold hover:underline group-hover:underline">
            View Profile <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  locationFilter, setLocationFilter,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  selectedPets, togglePet,
  selectedAmenities, toggleAmenity,
  selectedBusinessTypes, toggleBusinessType,
  onClear, activeCount,
}) {
  // Max must stay above Min; when it isn't we flag it and skip the price filter.
  const priceError = minPrice !== '' && maxPrice !== '' && Number(minPrice) >= Number(maxPrice)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <SlidersHorizontal size={15} /> Filters
          {activeCount > 0 && (
            <span className="bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center" style={{width:18,height:18}}>
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</label>
        <div className="relative">
          <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="City or area…"
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary bg-gray-50"
          />
        </div>
      </div>

      {/* Price / Night */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price / Night</label>
        <div className="flex items-center gap-2">
          {[
            { label: 'Min', val: minPrice, set: setMinPrice },
            { label: 'Max', val: maxPrice, set: setMaxPrice },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex-1">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                <input
                  type="number" min={0} placeholder="0"
                  value={val}
                  onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full pl-5 pr-1 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 ${
                    priceError ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-secondary/30'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
        {priceError && (
          <p className="text-red-500 text-xs mt-1.5">⚠ Max price must be greater than Min price</p>
        )}
      </div>

      {/* Pet type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pet Type</label>
        <div className="flex flex-wrap gap-2">
          {PET_FILTERS.map(({ id, label, icon: Icon }) => {
            const active = selectedPets.includes(id)
            return (
              <button
                key={id}
                onClick={() => togglePet(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stay Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stay Type</label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'homestay',     label: 'Homestay',     icon: '🏠' },
            { id: 'professional', label: 'Professional', icon: '🏢' },
          ].map(({ id, label, icon }) => {
            const active = selectedBusinessTypes.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggleBusinessType(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</label>
        <div className="space-y-2.5">
          {AMENITY_OPTIONS.map((amenity) => {
            const checked = selectedAmenities.includes(amenity)
            return (
              <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => toggleAmenity(amenity)}
                  className={`shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    checked ? 'bg-secondary border-secondary' : 'border-gray-300 group-hover:border-secondary'
                  }`}
                  style={{ width: 17, height: 17 }}
                >
                  {checked && (
                    <svg viewBox="0 0 10 8" className="fill-none stroke-white stroke-2" style={{width:10,height:8}}>
                      <polyline points="1,4 4,7 9,1" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 select-none group-hover:text-gray-900">{amenity}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BrowseHosts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { banners } = useBanners()
  const [searchParams] = useSearchParams()

  const [hosts,                 setHosts]                 = useState([])
  const [loadingHosts,          setLoadingHosts]          = useState(true)
  const [query,                 setQuery]                 = useState('')
  const [locationFilter,        setLocationFilter]        = useState('')
  const [minPrice,              setMinPrice]              = useState('')
  const [maxPrice,              setMaxPrice]              = useState('')
  const [selectedPets,          setSelectedPets]          = useState(() => {
    const pet = searchParams.get('pet')
    return pet ? [pet] : []
  })
  const [selectedAmenities,     setSelectedAmenities]     = useState([])
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState([])
  const [mobileFiltersOpen,     setMobileFiltersOpen]     = useState(false)
  const [page,                  setPage]                  = useState(1)
  const [totalPages,            setTotalPages]            = useState(1)
  const [total,                 setTotal]                 = useState(0)

  // Guards against out-of-order responses: only the newest request applies.
  const reqId = useRef(0)

  // Debounced, backend-driven fetch. Every filter/page change rebuilds the query
  // string and refetches; the debounce collapses rapid typing / slider drags
  // into a single request, and reqId ignores any response that a newer request
  // has already superseded.
  useEffect(() => {
    const params = { page, limit: PAGE_SIZE }
    if (query.trim())          params.name = query.trim()
    if (locationFilter.trim()) params.address = locationFilter.trim()
    // The backend needs BOTH bounds together, so only apply the price filter once
    // the user has entered both a valid min and max (min < max).
    const priceValid = minPrice !== '' && maxPrice !== '' && Number(minPrice) < Number(maxPrice)
    if (priceValid) {
      params.minPrice = Number(minPrice)
      params.maxPrice = Number(maxPrice)
    }
    if (selectedPets.length)
      params.boardingOfPets = JSON.stringify(selectedPets.map(p => PET_KEY[p]).filter(Boolean))
    if (selectedAmenities.length)
      params.amenities = JSON.stringify(selectedAmenities.map(a => AMENITY_KEY[a]).filter(Boolean))
    if (selectedBusinessTypes.length)
      params.bussinessType = JSON.stringify(selectedBusinessTypes.map(t => BUSINESS_TYPE_KEY[t]).filter(Boolean))

    const id = ++reqId.current
    const t = setTimeout(async () => {
      setLoadingHosts(true)
      try {
        const res = await axios.get('/api/host/get', { params })
        if (id !== reqId.current) return
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : [])
        setHosts(list.map(normalizeHost))
        setTotalPages(res.data?.totalPages || 1)
        setTotal(res.data?.total ?? list.length)
      } catch {
        if (id !== reqId.current) return
        setHosts([]); setTotalPages(1); setTotal(0)
      } finally {
        if (id === reqId.current) setLoadingHosts(false)
      }
    }, FETCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query, locationFilter, minPrice, maxPrice, selectedPets, selectedAmenities, selectedBusinessTypes, page])

  // Any filter change returns to page 1; pagination buttons change `page` alone.
  const togglePet          = (p) => { setPage(1); setSelectedPets(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]) }
  const toggleAmenity      = (a) => { setPage(1); setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]) }
  const toggleBusinessType = (t) => { setPage(1); setSelectedBusinessTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]) }
  const resetPage          = (setter) => (value) => { setPage(1); setter(value) }

  const activeFilterCount =
    (locationFilter ? 1 : 0) +
    (minPrice !== '' || maxPrice !== '' ? 1 : 0) +
    selectedPets.length +
    selectedAmenities.length +
    selectedBusinessTypes.length

  const clearFilters = () => {
    setPage(1)
    setLocationFilter(''); setMinPrice(''); setMaxPrice('')
    setSelectedPets([]); setSelectedAmenities([]); setSelectedBusinessTypes([])
  }

  // Backend does the filtering now; the only client-side rule left is hiding the
  // signed-in host's own listing when they've disabled it.
  const hideMyListing = localStorage.getItem('hostProfileDisabled') === 'true'
  const filtered = (hideMyListing && user?.id)
    ? hosts.filter(h => h._raw?.userId !== String(user.id))
    : hosts

  const panelProps = {
    locationFilter, setLocationFilter: resetPage(setLocationFilter),
    minPrice, setMinPrice: resetPage(setMinPrice),
    maxPrice, setMaxPrice: resetPage(setMaxPrice),
    selectedPets, togglePet,
    selectedAmenities, toggleAmenity,
    selectedBusinessTypes, toggleBusinessType,
    onClear: clearFilters, activeCount: activeFilterCount,
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative max-w-2xl">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value) }}
              placeholder="Search hosts by name"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-secondary transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center ml-0.5" style={{width:17,height:17}}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="hidden sm:block text-sm text-gray-400 whitespace-nowrap">
            {total} host{total !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Mobile filter overlay — scrolls internally, background stays put */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100 shrink-0">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <FilterPanel {...panelProps} />
          </div>
          <div className="shrink-0 border-t border-gray-100 p-4">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Show {total} result{total !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-5">
          <FilterPanel {...panelProps} />
        </aside>

        {/* Grid */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* Banner Slider */}
          {banners.length > 0 && (
            <div className="mb-5 rounded-2xl overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={banners.length > 1}
                className="w-full h-36 sm:h-44"
              >
                {banners.map((banner) => (
                  <SwiperSlide key={banner.id}>
                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {filtered.length === 0 ? (
            loadingHosts ? (
              <div className="flex items-center justify-center h-64">
                <PetLoader />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-lg font-semibold text-gray-700">No hosts match your filters</p>
                <p className="text-sm text-gray-400 mt-1">Try broadening your search or clearing filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-5 px-5 py-2.5 border border-secondary text-secondary text-sm font-semibold rounded-xl hover:bg-secondary hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )
          ) : (
            <>
              {/* Keep the current results visible during a refetch; a soft paw
                  overlay + dim reads as "loading" without the jarring blank flash. */}
              <div className="relative">
                {loadingHosts && (
                  <div className="absolute inset-0 z-10 flex justify-center pt-16 bg-gray-50/60 backdrop-blur-[1px] rounded-2xl">
                    <PetLoader />
                  </div>
                )}
                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 transition-opacity duration-300 ${loadingHosts ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  {filtered.map((host) => (
                    <HostCard
                      key={host.id}
                      host={host}
                      onClick={() => navigate(`/hosts/${host.id}`, { state: { host } })}
                    />
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700"
                  >
                    <ChevronRight size={15} className="rotate-180" /> Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page <span className="font-bold text-gray-800">{page}</span> of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-secondary hover:text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
