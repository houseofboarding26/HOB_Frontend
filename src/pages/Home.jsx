import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import {
  Shield, Clock, Heart, Search, ChevronRight, ChevronLeft,
  CheckCircle, Camera, MessageCircle, PawPrint, Dog, Cat, Bird, Rabbit,
  Volume2, VolumeX, Star, MapPin, BadgeCheck, ChevronDown,
} from 'lucide-react'
import hobLogo from '../assets/hob-logo.png'
import Navbar from '../components/Navbar'
import { useVideos } from '../context/VideoContext'
import { useAuth } from '../context/AuthContext'

// ─── Imagery ────────────────────────────────────────────────────────────────
// Real photos give the page warmth. Each <img> gets a picsum fallback via
// onImgError so a broken/blocked URL degrades to another photo, never an icon.

const IMG = {
  heroPet:   'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
  heroThumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80',
  whyPet:    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
  whyPetSm:  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80',
  ctaPet:    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
  step1:     'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=700&q=80',
  step2:     'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=700&q=80',
  step3:     'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80',
  face1:     'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  face2:     'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  face3:     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  face4:     'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=120&q=80',
  catDog:    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
  catCat:    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
  catBird:   'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
  catSmall:  'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
}

const onImgError = (e, seed, w = 800, h = 600) => {
  if (e.currentTarget.dataset.fallback) return
  e.currentTarget.dataset.fallback = '1'
  e.currentTarget.src = `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRUST_REASONS = [
  {
    icon: Shield,
    title: 'Verified Hosts',
    desc: 'Background checks, home inspections, and pet-care training before any host goes live.',
    color: 'bg-blue-50 text-secondary',
  },
  {
    icon: Camera,
    title: 'Live Updates',
    desc: 'Real-time photos and videos of your pet through their whole stay — peace of mind, delivered.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Clock,
    title: '24 / 7 Support',
    desc: 'Our care team is on call around the clock for both pet owners and hosts, any time.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Heart,
    title: 'Pet-First Culture',
    desc: "Hosts love animals as much as you do. We match pets to homes where they'll feel at ease.",
    color: 'bg-pink-50 text-pink-600',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Search Nearby',
    desc: 'Enter your location and dates to discover verified boarding hosts around you.',
    img: IMG.step1,
    seed: 'hob-search',
  },
  {
    step: '02',
    icon: MessageCircle,
    title: 'Connect & Book',
    desc: 'Browse profiles, read reviews, chat with hosts, and book in a few secured clicks.',
    img: IMG.step2,
    seed: 'hob-connect',
  },
  {
    step: '03',
    icon: PawPrint,
    title: 'Drop Off & Relax',
    desc: 'Leave your pet with confidence, get daily updates, and collect them happy.',
    img: IMG.step3,
    seed: 'hob-relax',
  },
]

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sneha Kapoor',
    pet: 'Golden Retriever mom',
    avatar: IMG.face1,
    seed: 'hob-face-1',
    rating: 5,
    text: "Priya took such amazing care of Bruno while I was travelling! Photos every few hours and he even made doggy friends. An absolute lifesaver for pet parents.",
    location: 'Bangalore',
  },
  {
    id: 2,
    name: 'Arjun Nair',
    pet: 'Indie cat parent',
    avatar: IMG.face2,
    seed: 'hob-face-2',
    rating: 5,
    text: "I was anxious leaving Mochi for the first time. Ananya understood cats perfectly.House of boardingmade finding her easy and the booking was seamless.",
    location: 'Hyderabad',
  },
  {
    id: 3,
    name: 'Meera Pillai',
    pet: 'Labrador & Beagle mom',
    avatar: IMG.face3,
    seed: 'hob-face-3',
    rating: 5,
    text: "Two dogs, one host, zero stress. Karan managed both Toffee and Biscuit brilliantly — I actually enjoyed my vacation. 10/10 recommend HOB.",
    location: 'Ahmedabad',
  },
]

const PET_FILTERS = [
  { label: 'Dogs', icon: Dog },
  { label: 'Cats', icon: Cat },
  { label: 'Birds', icon: Bird },
  { label: 'Rabbits', icon: Rabbit },
]

const CATEGORIES = [
  { label: 'Dogs',       tag: 'dogs',   img: IMG.catDog,   seed: 'hob-cat-dog',   blurb: 'Playful walks & cozy nights' },
  { label: 'Cats',       tag: 'cats',   img: IMG.catCat,   seed: 'hob-cat-cat',   blurb: 'Calm, quiet, purr-fect stays' },
  { label: 'Birds',      tag: 'birds',  img: IMG.catBird,  seed: 'hob-cat-bird',  blurb: 'Chirpy care & clean cages' },
  { label: 'Small Pets', tag: 'small',  img: IMG.catSmall, seed: 'hob-cat-small', blurb: 'Rabbits, hamsters & more' },
]

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Gurgaon',
]

const FAQS = [
  {
    q: 'How do you make sure my pet is safe?',
    a: 'Every host is background-verified, home-inspected, and trained in pet first-aid before they can list. During the stay you get live photo and video updates, and our care team is on call 24/7 — so you always know how your pet is doing.',
  },
  {
    q: 'What if I need to cancel my booking?',
    a: 'Plans change, we get it. Add Cancellation Protection at checkout for a full refund when you cancel before 8 AM on check-in day. Without it, you still get a 90% refund within 24 hours of booking.',
  },
  {
    q: 'Which pets can I board on HOB?',
    a: 'Dogs, cats, birds, rabbits and most small pets. Each host lists exactly which pets and sizes they welcome, along with room, cage and pricing details, so you can match your pet to the right home.',
  },
  {
    q: 'How much does pet boarding cost?',
    a: 'Prices are set by each host and typically start around ₹499/night, varying by pet type, size and add-on services like grooming or extra walks. You will always see the full price before you pay — no hidden fees.',
  },
  {
    q: 'Can I become a host and earn with HOB?',
    a: "Absolutely. If you love animals and have a safe space, you can list for free, set your own prices and availability, and start earning. We handle payments, bookings and support — you focus on the pets.",
  },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// function VideoSlider() {
//   const { videos, extractYouTubeId } = useVideos()
//   const [mutedMap, setMutedMap] = useState({})
//   const prevRef = useRef(null)
//   const nextRef = useRef(null)

//   const toggleMute = (id) =>
//     setMutedMap((m) => ({ ...m, [id]: m[id] !== false }))
//   const isMuted = (id) => mutedMap[id] !== false

//   if (videos.length === 0) return null

//   return (
//     <section className="py-14 sm:py-24 px-4 bg-gray-50">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8 sm:mb-12">
//           <span className="section-eyebrow text-secondary font-bold text-xs uppercase">Hand-picked for you</span>
//           <h2 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 mt-2">See House of Boarding in Action</h2>
//         </div>

//         <div className="relative">
//           <button ref={prevRef} className="absolute -left-5 top-[45%] -translate-y-1/2 w-11 h-11 bg-white shadow-lg border border-gray-100 text-gray-700 hover:text-secondary hover:border-secondary rounded-full flex items-center justify-center transition-all z-10">
//             <ChevronLeft size={20} />
//           </button>
//           <button ref={nextRef} className="absolute -right-5 top-[45%] -translate-y-1/2 w-11 h-11 bg-white shadow-lg border border-gray-100 text-gray-700 hover:text-secondary hover:border-secondary rounded-full flex items-center justify-center transition-all z-10">
//             <ChevronRight size={20} />
//           </button>

//           <Swiper
//             modules={[Navigation, Pagination, Autoplay]}
//             loop={true}
//             autoplay={{ delay: 5000, disableOnInteraction: false }}
//             navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
//             onSwiper={(swiper) => {
//               swiper.params.navigation.prevEl = prevRef.current
//               swiper.params.navigation.nextEl = nextRef.current
//               swiper.navigation.init()
//               swiper.navigation.update()
//             }}
//             pagination={{ clickable: true, el: '.video-swiper-dots' }}
//             breakpoints={{
//               0:   { slidesPerView: 1, spaceBetween: 12 },
//               640: { slidesPerView: 2, spaceBetween: 14 },
//               900: { slidesPerView: 4, spaceBetween: 16 },
//             }}
//           >
//             {videos.map((video) => {
//               const ytId = extractYouTubeId(video.url)
//               if (!ytId) return null
//               const id = video._id || video.id
//               const muted = isMuted(id)
//               const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0`
//               return (
//                 <SwiperSlide key={id}>
//                   <div className="group">
//                     <div className="relative rounded-2xl overflow-hidden bg-gray-200 shadow-sm" style={{ paddingTop: '177.78%' }}>
//                       <iframe
//                         key={`${ytId}-${muted}`}
//                         src={embedUrl}
//                         title={video.title}
//                         allow="autoplay; encrypted-media"
//                         className="absolute inset-0 w-full h-full border-0"
//                       />
//                       <button
//                         onClick={() => toggleMute(id)}
//                         className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
//                         title={muted ? 'Unmute' : 'Mute'}
//                       >
//                         {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
//                       </button>
//                     </div>
//                     <div className="mt-2.5 px-0.5">
//                       <p className="text-gray-900 text-sm font-semibold leading-snug line-clamp-2">{video.title}</p>
//                     </div>
//                   </div>
//                 </SwiperSlide>
//               )
//             })}
//           </Swiper>

//           <div className="video-swiper-dots flex justify-center gap-2 mt-6" />
//         </div>
//       </div>
//     </section>
//   )
// }

function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="py-14 sm:py-24 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-eyebrow text-secondary font-bold text-xs uppercase">Good to know</span>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 mt-2">Questions, answered</h2>
          <p className="text-gray-500 mt-3">Everything you want to know before your pet's first stay.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className={`rounded-2xl border transition-colors ${isOpen ? 'border-secondary/30 bg-secondary/[0.03]' : 'border-gray-200 bg-white'}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5"
                >
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">{f.q}</span>
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-secondary text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                    <ChevronDown size={17} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 text-gray-500 text-sm sm:text-[0.95rem] leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Still curious?{' '}
          <Link to="/hosts" className="text-secondary font-semibold hover:underline">Browse hosts</Link>{' '}
          or reach our team anytime.
        </p>
      </div>
    </section>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const { startBecomeHost } = useAuth()
  // Logged-in customers skip the host signup form and go straight to property setup.
  const goBecomeHost = (e) => { e.preventDefault(); navigate(startBecomeHost()) }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF5] via-white to-secondary/5">
        <div className="absolute inset-0 hero-dots pointer-events-none" />
        <div className="absolute -top-24 -right-16 w-[26rem] h-[26rem] bg-primary/20 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute -bottom-28 -left-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none animate-blob" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white text-secondary font-semibold text-sm px-4 py-1.5 rounded-full mb-6 border border-secondary/15 shadow-sm">
              <PawPrint size={14} className="text-primary" />
              India's Trusted Pet Boarding Network
            </span>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 leading-[1.03] mb-5">
              A loving second home for your pet,{' '}
              <span className="text-gradient-brand italic font-medium">right nearby.</span>
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Real homes, real care. Book verified hosts who treat your dog, cat, or bird like family — with daily photo updates while you're away.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-8">
              <Link
                to="/hosts"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-white font-bold px-8 py-4 rounded-2xl text-base hover:bg-secondary-dark transition-colors shadow-lg shadow-secondary/25"
              >
                <Search size={18} /> Find a Host Near You
              </Link>
              <Link
                to="/register/host"
                onClick={goBecomeHost}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-800 font-bold px-8 py-4 rounded-2xl text-base border border-gray-200 hover:border-secondary hover:text-secondary transition-colors"
              >
                Become a Host
              </Link>
            </div>

            {/* Pet type quick filters */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {PET_FILTERS.map(({ label, icon: Icon }) => (
                <Link
                  key={label}
                  to={`/hosts?pet=${label.toLowerCase()}`}
                  className="flex items-center gap-1.5 bg-white hover:bg-secondary hover:text-white text-gray-700 px-4 py-2 rounded-full border border-gray-200 hover:border-secondary transition-colors font-medium text-sm shadow-sm"
                >
                  <Icon size={14} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-3">
                {[IMG.face1, IMG.face2, IMG.face3, IMG.face4].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    onError={(e) => onImgError(e, `hob-trust-${i}`, 120, 120)}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover bg-gray-100"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <StarRating rating={5} />
                  <span className="text-sm font-bold text-gray-900 ml-1">4.9</span>
                </div>
                <p className="text-xs text-gray-500">Loved by 10,000+ pet parents</p>
              </div>
            </div>
          </div>

          {/* Right — image collage */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute inset-0 -m-4 bg-gradient-to-br from-primary/25 to-secondary/25 rounded-[2.5rem] blur-2xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] sm:aspect-[5/5]">
              <img
                src={IMG.heroPet}
                alt="Happy dog with a caring host"
                onError={(e) => onImgError(e, 'hob-hero', 900, 1000)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating card — verified host */}
            <div className="glass-card absolute -left-3 sm:-left-6 top-8 rounded-2xl px-4 py-3 flex items-center gap-3 animate-floaty">
              <img
                src={IMG.face3}
                alt=""
                onError={(e) => onImgError(e, 'hob-host-face', 120, 120)}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-gray-900">Meera I.</p>
                  <BadgeCheck size={14} className="text-secondary" />
                </div>
                <p className="text-xs text-gray-500">Verified Host · 4.9 ★</p>
              </div>
            </div>

            {/* Floating card — live update */}
            <div className="glass-card absolute -right-2 sm:-right-5 bottom-8 rounded-2xl px-4 py-3 flex items-center gap-3 animate-floaty-slow">
              <img
                src={IMG.heroThumb}
                alt=""
                onError={(e) => onImgError(e, 'hob-live', 120, 120)}
                className="w-11 h-11 rounded-xl object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-bold text-gray-900">Live update</p>
                </div>
                <p className="text-xs text-gray-500">Mochi is having fun 🐾</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="bg-secondary">
        <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-white/15 py-8 sm:py-10 px-4 text-center">
          {[
            { value: '500+', label: 'Verified Hosts' },
            { value: '10K+', label: 'Happy Pets' },
            { value: '4.9 ★', label: 'Average Rating' },
          ].map(({ value, label }) => (
            <div key={label} className="px-2">
              <p className="font-display text-4xl sm:text-5xl font-semibold text-primary">{value}</p>
              <p className="text-white/70 font-medium mt-1 text-xs sm:text-base">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cities strip ── */}
      <section className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-5 lg:gap-8">
          <p className="text-sm text-gray-400 font-medium whitespace-nowrap shrink-0">
            <span className="text-gray-900 font-bold">Now boarding pets</span> across India
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {CITIES.map((city) => (
              <span
                key={city}
                className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
              >
                <MapPin size={12} className="text-secondary/60" />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pet Categories ── */}
      <section className="py-14 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="section-eyebrow text-secondary font-bold text-xs uppercase">Every companion welcome</span>
              <h2 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 mt-2 leading-[1.05]">
                A safe stay for<br className="hidden sm:block" /> every kind of pet
              </h2>
            </div>
            <Link
              to="/hosts"
              className="inline-flex items-center gap-1.5 text-secondary font-semibold hover:gap-2.5 transition-all self-start sm:self-auto"
            >
              View all hosts <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CATEGORIES.map(({ label, tag, img, seed, blurb }) => (
              <Link
                key={label}
                to={`/hosts?pet=${tag}`}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-shadow"
              >
                <img
                  src={img}
                  alt={label}
                  onError={(e) => onImgError(e, seed, 600, 750)}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                  <h3 className="text-white font-bold text-lg sm:text-xl">{label}</h3>
                  <p className="text-white/70 text-xs sm:text-sm mt-0.5">{blurb}</p>
                  <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-2 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all">
                    Find hosts <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video Slider ── */}
      {/* <VideoSlider /> */}

      {/* ── WhyHouse of boarding── */}
      <section className="py-14 sm:py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image collage */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-[2rem] overflow-hidden shadow-xl aspect-[4/3]">
              <img
                src={IMG.whyPet}
                alt="Pet parent hugging their dog"
                onError={(e) => onImgError(e, 'hob-why', 900, 700)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block absolute -bottom-8 -right-4 w-44 h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={IMG.whyPetSm}
                alt="Puppy"
                onError={(e) => onImgError(e, 'hob-why-sm', 500, 500)}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stat */}
            <div className="glass-card absolute -top-5 left-4 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 animate-floaty">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Heart size={17} className="text-green-600 fill-green-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900 leading-none">10,000+</p>
                <p className="text-xs text-gray-500 mt-0.5">Cared-for pets</p>
              </div>
            </div>
          </div>

          {/* Reasons */}
          <div className="order-1 lg:order-2">
            <span className="section-eyebrow text-secondary font-bold text-xs uppercase">Our Promise</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 mt-2 mb-3 leading-[1.05]">
              Why pet parents choose House of boarding
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg">
              We set the highest standards so your pet gets nothing but the best — every single stay.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {TRUST_REASONS.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="card-lift rounded-2xl p-5 border border-gray-100 bg-white shadow-sm">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 sm:py-24 px-4 bg-secondary overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="section-eyebrow text-primary font-bold text-xs uppercase">Simple &amp; Quick</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mt-2">How It Works</h2>
            <p className="text-white/60 mt-3">Find the perfect boarding stay in under 3 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, img, seed }, i) => (
              <div key={step} className="card-lift bg-white rounded-3xl overflow-hidden shadow-lg">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    onError={(e) => onImgError(e, seed, 700, 440)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute top-3 left-3 w-9 h-9 bg-primary text-gray-900 text-sm font-extrabold rounded-xl flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                  <div className="absolute bottom-3 right-3 w-11 h-11 bg-white/90 rounded-2xl flex items-center justify-center shadow">
                    <Icon size={22} className="text-secondary" />
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold text-secondary/60 mb-1">STEP {step}</p>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/hosts"
              className="inline-flex items-center gap-2 bg-primary text-gray-900 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Find a Host <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-14 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-eyebrow text-secondary font-bold text-xs uppercase">What Pet Parents Say</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-gray-900 mt-2">Tails of Happy Pets</h2>
            <p className="text-gray-500 mt-3">Real stories from real families who trust HOB.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="card-lift relative bg-white rounded-3xl p-7 shadow-sm border border-gray-100 flex flex-col">
                <span className="absolute top-5 right-6 text-6xl leading-none text-secondary/10 font-serif select-none">&rdquo;</span>
                <div className="mb-4">
                  <StarRating rating={t.rating} size="md" />
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6 relative">
                  {t.text}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    onError={(e) => onImgError(e, t.seed, 120, 120)}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100 border-2 border-primary/40"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      {t.pet} · <MapPin size={10} /> {t.location}
                    </p>
                  </div>
                  <BadgeCheck size={18} className="text-green-500 ml-auto shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── CTA Banner ── */}
      <section className="py-14 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-secondary to-secondary-dark overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-2">
            {/* Left content */}
            <div className="p-8 sm:p-12 lg:p-14">
              <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-4">
                <PawPrint size={14} /> Join theHouse of boardingFamily
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-[1.08]">
                Ready to give your pet the stay they deserve?
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-7">
                Discover verified hosts in your city and book in minutes. Your pet's happiness is just a click away.
              </p>
              <div className="space-y-2.5 mb-8">
                {[
                  'Free to join — no subscription fees',
                  'Instant booking with secure payments',
                  'Daily updates & live photo reports',
                  'Full refund guarantee on cancellations',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span className="text-white/85 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/hosts"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-gray-900 font-bold px-7 py-3.5 rounded-xl hover:bg-yellow-400 transition-colors"
                >
                  Find a Host
                </Link>
                <Link
                  to="/register/host"
                  onClick={goBecomeHost}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  I'm a Host
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="relative min-h-[240px] md:min-h-full">
              <img
                src={IMG.ctaPet}
                alt="Happy dogs ready to play"
                onError={(e) => onImgError(e, 'hob-cta', 900, 700)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/70 via-secondary/10 to-transparent md:from-secondary md:via-secondary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white/50 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center">
            <img className='hob-login-page-logo' src={hobLogo} alt='' />
          </div>
          <p>© 2026 House of boarding. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cancellation-policy" className="hover:text-white transition-colors">Cancellation</Link>
            <Link to="/safety-policy" className="hover:text-white transition-colors">Safety</Link>
            <Link to="/hosts" className="hover:text-white transition-colors">Browse Hosts</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
