// Labels match the amenities shown in the host onboarding form, in the same
// order. This is the single source of truth: the browse filter derives its
// options from AMENITY_OPTIONS so filtering always lines up with host data.
export const AMENITY_LABEL = {
  '24/7_CCTV':                         '24/7 CCTV',
  ac_rooms:                            'AC Rooms',
  agility_setup:                       'Agility Setup',
  anti_tick_treatment:                 'Anti-Tick Treatment',
  cage_free:                           'Cage Free',
  cooler:                              'Cooler',
  customized_meals:                    'Customized Meals',
  daily_cleanings:                     'Daily Cleaning',
  daily_real_time_stamped_photo_video: 'Daily Real-time Updates',
  dry_dog_food:                        'Dry Dog Food',
  extended_hours:                      'Extended Hours',
  fresh_drinking_water:                'Fresh Drinking Water',
  glass_doors:                         'Glass Doors',
  grooming:                            'Grooming',
  home_food:                           'Home Food',
  individual_cage:                     'Individual Cage',
  personal_beds:                       'Personal Beds',
  pet_cafe:                            'Pet Cafe',
  pet_friendly_music:                  'Pet Friendly Music',
  pet_store:                           'Pet Store',
  pick_and_drop_facility:              'Pick & Drop',
  play_areas:                          'Play Areas',
  plush_blankets:                      'Plush Blankets',
  scheduled_leash_walks:               'Scheduled Leash Walks',
  solo_attention:                      'Solo Attention',
  spa:                                 'Spa',
  swimming:                            'Swimming',
  vaccinated_pets_only:                'Vaccinated Pets Only',
  veg_meals:                           'Veg Meals',
  veterinary_support:                  'Veterinary Support',
}

// Ordered list of amenity labels for the browse filter.
export const AMENITY_OPTIONS = Object.values(AMENITY_LABEL)

// Reverse lookups used to translate browse-filter selections back into the
// keys the backend expects on the /api/host/get query string.
export const AMENITY_KEY = Object.fromEntries(
  Object.entries(AMENITY_LABEL).map(([key, label]) => [label, key]),
)
export const PET_KEY = { dogs: 'Dog', cats: 'Cat', birds: 'Bird', small: 'smallPet' }
export const BUSINESS_TYPE_KEY = { homestay: 'Homestay', professional: 'Professional' }

const AMENITY_ICON = {
  '24/7_CCTV':                         '📷',
  ac_rooms:                            '❄️',
  agility_setup:                       '🏃',
  anti_tick_treatment:                 '🪲',
  cage_free:                           '🔓',
  cooler:                              '💨',
  customized_meals:                    '🍽️',
  daily_cleanings:                     '🧹',
  daily_real_time_stamped_photo_video: '📱',
  dry_dog_food:                        '🦴',
  extended_hours:                      '⏰',
  fresh_drinking_water:                '💧',
  glass_doors:                         '🚪',
  grooming:                            '✂️',
  home_food:                           '🍱',
  individual_cage:                     '🏠',
  personal_beds:                       '🛏️',
  pet_cafe:                            '☕',
  pet_friendly_music:                  '🎵',
  pet_store:                           '🏪',
  pick_and_drop_facility:              '🚗',
  play_areas:                          '🎾',
  plush_blankets:                      '🛌',
  scheduled_leash_walks:               '🦮',
  solo_attention:                      '👤',
  spa:                                 '🛁',
  swimming:                            '🏊',
  vaccinated_pets_only:                '💉',
  veg_meals:                           '🥗',
  veterinary_support:                  '🏥',
}

const PET_MAP = { Dog: 'dogs', Cat: 'cats', Bird: 'birds', smallPet: 'small' }

// Display label + emoji for the raw API pet-type keys.
const PET_LABEL_MAP = {
  Dog:      { label: 'Dog',       emoji: '🐕' },
  Cat:      { label: 'Cat',       emoji: '🐈' },
  Bird:     { label: 'Bird',      emoji: '🦜' },
  smallPet: { label: 'Small Pet', emoji: '🐹' },
}

const SERVICE_MAP = {
  overnight_multiday_boarding: 'Boarding',
  emergency_boarding:          'Emergency',
}

export function normalizeHost(h) {
  // pricing object
  const pricing = {}
  ;(h.pricePerPet || []).forEach(({ petType, price, small, medium, large }) => {
    if (petType === 'Dog') {
      if (small?.price)  pricing.dogSmall  = small.price
      if (medium?.price) pricing.dogMedium = medium.price
      if (large?.price)  pricing.dogLarge  = large.price
    } else if (petType === 'Cat')    pricing.cat   = price
    else if  (petType === 'Bird')    pricing.bird  = price
    else if  (petType === 'smallPet') pricing.small = price
  })

  const prices = Object.values(pricing).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0

  // "Starting from" price shown on cards: prefer Dog Small, then any Dog size,
  // then fall back to the first available non-dog pet (Cat → Bird → Small).
  const startingPrice =
    pricing.dogSmall ?? pricing.dogMedium ?? pricing.dogLarge ??
    pricing.cat ?? pricing.bird ?? pricing.small ?? 0

  const pets = (h.boardingOfPets || []).map(p => PET_MAP[p]).filter(Boolean)

  const amenities = (h.amenities || []).map(k => AMENITY_LABEL[k] || k)

  const paidAmenities = (h.paidAmenities || []).map(({ amenitie, price, info }) => ({
    key: amenitie,                                  // raw enum key (e.g. "swimming") for the booking API
    name: AMENITY_LABEL[amenitie] || amenitie,
    icon: AMENITY_ICON[amenitie] || '✓',
    price,
    info,
  }))

  const serviceTypes = (h.services || h.Services || []).map(k => SERVICE_MAP[k]).filter(Boolean)

  // Per-pet capacity / rooms / cages / sizes, merged into one row per pet type
  // so the detail page can render a single "Capacity & Facilities" table.
  const facilities = (h.boardingOfPets || []).map((pt) => {
    const meta  = PET_LABEL_MAP[pt] || { label: pt, emoji: '🐾' }
    const cap   = (h.capacity   || []).find(c => c.petType === pt)?.capacity
    const rooms = (h.numberOfRooms || {})[pt] || {}
    const area  = (h.sizeOfRooms || []).find(s => s.petType === pt)?.area
    const cage  = (h.sizeOfCages || []).find(s => s.petType === pt) || {}
    return {
      petType:  pt,
      label:    meta.label,
      emoji:    meta.emoji,
      capacity: cap ?? null,
      rooms:    rooms.room ?? null,
      cages:    rooms.cage ?? null,
      roomArea: area ?? null,
      cageDims: (cage.length && cage.breadth && cage.height)
        ? `${cage.length} × ${cage.breadth} × ${cage.height}` : null,
    }
  })

  // Address may be a structured object ({ street, area, city, state, pincode })
  // from the newer API, or a legacy "streetAddress, city, pincode" string.
  let city = '', area = '', state = '', fullAddress = ''
  if (h.address && typeof h.address === 'object') {
    const a = h.address
    city  = a.city  || ''
    area  = a.area  || ''
    state = a.state || ''
    fullAddress = [a.street, a.area, a.city, a.state, a.pincode].filter(Boolean).join(', ')
  } else {
    const addrParts = (h.address || '').split(',').map(s => s.trim())
    city        = addrParts.length >= 2 ? addrParts[addrParts.length - 2] : addrParts[0] || ''
    fullAddress = h.address || ''
  }
  const location = city

  const bt = (h.bussinessType || '').toLowerCase()
  const businessType = bt === 'professional' ? 'professional' : 'homestay'

  const photos = h.propertyPhotos || h.photos || []
  const name   = h.propertyName || h.nameOfBusiness || 'Unknown'
  // Use a real profile photo only if the API provides one; otherwise the
  // <Avatar> component renders the host's initials (e.g. "Aman Singh" → "AS").
  const avatar = h.avatar || h.photoUrl || h.user?.avatar || ''

  return {
    id:          h._id || h.id,
    name,
    avatar,
    city,
    area,
    state,
    location,
    rating:      h.rating      || 0,
    reviewCount: h.reviewCount || 0,
    price:       minPrice,
    startingPrice,
    coverPhoto:  photos[0] || '',
    priceRange:  prices.length > 1 ? `₹${minPrice}–₹${maxPrice}` : prices.length === 1 ? `₹${minPrice}` : '—',
    pets,
    amenities,
    paidAmenities,
    pricing,
    serviceTypes,
    // Flat per-booking price for Emergency Boarding, when the backend provides
    // it. null → the frontend falls back to the config default.
    emergencyBoardingPrice: h.emergencyBoardingPrice ?? null,
    services:    [],
    bio:         h.about || h.aboutBusiness || h.experienceWithPets || '',
    badge:       h.badge || '',
    // Admin-managed badges (set via the host admin API). Field names match the
    // backend exactly: topRated, mostPopullar (sic), physicalverification.
    topRated:         !!h.topRated,
    mostPopular:      !!h.mostPopullar,
    physicalVerified: !!h.physicalverification,
    businessType,
    photos,
    reviews:     h.reviews || [],
    available:   h.status === 'verified',

    // ── Extra detail-page fields (all optional; blank when the list endpoint
    //    doesn't include them) ──
    fullAddress,
    businessName:         h.nameOfBusiness || '',
    businessTypeLabel:    h.bussinessType || '',
    propertyType:         h.propertyType || '',
    status:               h.status || '',
    experience:           h.experienceWithPets || '',
    rules:                h.rule || '',
    facilities,
    limitationsForGuests: h.limitationsForGuests ?? null,
    propertyAreaSize:     h.propertyAreaSize ?? null,
    numberOfCareTakers:   h.numberOfCareTakers ?? null,

    _raw:        h,
  }
}
