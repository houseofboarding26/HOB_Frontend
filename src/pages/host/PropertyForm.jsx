import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { resolveHostIdForUser } from '../../services/hostService'

const API_BASE = ''
import {
  Check, ChevronLeft, ChevronRight, ChevronDown, Upload, Building2,
  FileText, Fingerprint, Lock, X, Edit3,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'About',            desc: 'Property info, pets & services',    icon: Building2   },
  { id: 2, title: 'Business Details', desc: 'Operations, amenities & photos',    icon: FileText    },
  { id: 3, title: 'Verification',     desc: 'Identity and compliance documents', icon: Fingerprint },
]

const INDIAN_CITIES = [
  'Adilabad','Agartala','Agra','Ahmedabad','Ahmednagar','Aizawl','Ajmer',
  'Akola','Alappuzha','Aligarh','Alwar','Amalner','Ambajogai','Ambala',
  'Ambikapur','Amravati','Amreli','Amritsar','Anand','Anantapur','Anantnag',
  'Arrah','Asansol','Ayodhya','Bagalkot','Bahadurgarh','Balasore','Ballari',
  'Balurghat','Banda','Bankura','Baramati','Baramulla','Bardhaman','Bardoli',
  'Bareilly','Baripada','Barmer','Barshi','Bathinda','Becharaji','Beed',
  'Begusarai','Belagavi','Bengaluru','Berhampur','Bettiah',
  'Bhadradri Kothagudem','Bhagalpur','Bhavnagar','Bhandara','Bharatpur',
  'Bharuch','Bhilwara','Bhimavaram','Bhiwandi','Bhopal','Bhubaneswar',
  'Bhuj','Bhusawal','Bidar','Biharsharif','Bijnor','Bikaner','Bilaspur',
  'Bokaro','Bulandshahr','Buldhana','Bundi','Burhanpur','Chalisgaon',
  'Chandigarh','Chandrapur','Chennai','Chhatrapati Sambhajinagar',
  'Chikkamagaluru','Chiplun','Chitradurga','Chittoor','Chittorgarh','Churu',
  'Coimbatore','Cooch Behar','Cuddalore','Cuttack','Dahod','Darbhanga',
  'Darjeeling','Daund','Davanagere','Dehradun','Delhi','Deoghar','Dewas',
  'Dhamtari','Dhanbad','Dharamshala','Dharashiv','Dharmapuri','Dhule',
  'Dibrugarh','Dimapur','Dindigul','Durg-Bhilai','Durgapur','Eluru',
  'Ernakulam','Erode','Etawah','Faridabad','Firozabad','Gadag','Gadhinglaj',
  'Gadwal','Gandhidham','Gandhinagar','Gangtok','Gaya','Ghaziabad','Giridih',
  'Godhra','Gondia','Gorakhpur','Greater Noida','Guntur','Gurdaspur',
  'Gurugram','Guwahati','Gwalior','Hajipur','Haldia','Haldwani',
  'Hanumangarh','Hapur','Haridwar','Hassan','Hazaribagh','Hingoli','Hisar',
  'Hoshangabad','Hosur','Howrah-Hooghly','Hubballi-Dharwad','Hyderabad',
  'Ichalkaranji','Imphal','Indapur','Indore','Islampur','Itanagar',
  'Jabalpur','Jagdalpur','Jagtial','Jaipur','Jalandhar','Jalgaon','Jalna',
  'Jalpaiguri','Jammu','Jamnagar','Jamshedpur','Jaysingpur','Jhansi',
  'Jharsuguda','Jhunjhunu','Jind','Jodhpur','Jorhat','Junagadh','Kachchh',
  'Kadapa','Kadi','Kagal','Kaithal','Kalaburagi','Kalol','Kalyan Dombivli',
  'Kamareddy','Kanchipuram','Kannur','Kanpur','Karad','Karimnagar','Karnal',
  'Karur','Karwar','Kasaragod','Kathua','Katihar','Katni','Kavaratti',
  'Khamgaon','Khammam','Khandwa','Kharagpur','Kharar','Kochi','Kohima',
  'Kolar','Kolhapur','Kolkata','Kollam','Kopargaon-Shirdi','Korba','Kota',
  'Kottayam','Kozhikode','Krishnanagar','Kullu','Kumbakonam','Kurnool',
  'Lakhimpur','Latur','Leh','Lucknow','Ludhiana','Machilipatnam','Madikeri',
  'Madurai','Mahad','Mahbubnagar','Malappuram','Malda','Malegaon','Malvan',
  'Mancherial','Mandi','Mandsaur','Mandya','Mangaluru','Margao','Mathura',
  'Medinipur','Meerut','Mehsana','Mira Bhayandar','Mirzapur','Modasa',
  'Mohali','Moradabad','Morbi','Motihari','Mumbai','Mundra','Muzaffarnagar',
  'Muzaffarpur','Mysuru','Nadiad','Nagaon','Nagaur','Nagercoil','Nagpur',
  'Nalgonda','Nanded','Nandyala','Narsipatnam','Nashik','Navi Mumbai',
  'Navsari','Neemuch','Nellore','Nilanga','Nirmal','Nizamabad','Noida',
  'North Bengal','North Goa','Omerga','Ongole','Orai','Ozar','Pachora',
  'Palakkad','Palakollu','Palanpur','Palghar-Boisar','Pali','Panaji',
  'Panchkula','Pandharpur','Panipat','Parbhani','Patan','Pathanamthitta',
  'Pathankot','Patiala','Patna','Phaltan','Phusro','Pimpalgaon Baswant',
  'Pollachi','Porbandar','Port Blair','Prayagraj','Proddatur','Puducherry',
  'Pune','Puri','Purnia','Raebareli','Raichur','Raigad','Raigarh','Raipur',
  'Rajahmundry','Rajkot','Rajnandgaon','Rampur','Ranchi','Ratlam',
  'Ratnagiri','Rewa','Rewari','Rishikesh','Rohtak','Roorkee','Ropar',
  'Rourkela','Sabarkantha','Sagar','Saharanpur','Saharsa','Sakri','Salem',
  'Sambalpur','Sangli','Sangrur','Sasaram','Satara','Satna','Sawantwadi',
  'Shahada-Nandurbar','Shahapur-Murbad','Shillong','Shimla','Shirpur',
  'Shivamogga','Siddipet','Sikar','Silchar','Siliguri','Silvassa',
  'Sindhudurg','Sinnar','Sitapur','Solan','Solapur','Sonipat','South Goa',
  'Sri Ganganagar','Srikakulam','Srinagar','Sultanpur','Surat',
  'Surendranagar','Tadepalligudem','Tezpur','Thane','Thanjavur',
  'Thiruvananthapuram','Thrissur','Tiruchirappalli','Tirunelveli','Tirupati',
  'Tiruppur','Tonk','Tumakuru','Tuni','Tura','Tuticorin','Udaipur','Udgir',
  'Udupi','Ujjain','Unjha','Uran-Dronagiri','Vadodara','Valsad','Vapi',
  'Varanasi','Vasai-Virar','Vasco da Gama','Vellore','Veraval','Vijapur',
  'Vijayapura','Vijayawada','Visakhapatnam','Visnagar','Vizianagaram',
  'Vyara','Wanaparthy','Wani','Warangal','Wardha','Washim','Yamunanagar',
  'Yavatmal','Zirakpur',
]

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const FREE_AMENITIES = [
  { key: 'amenCCTV',            label: '24/7 CCTV',               icon: '📷', value: '24/7_CCTV'                          },
  { key: 'amenAC',              label: 'AC Rooms',                 icon: '❄️', value: 'ac_rooms'                           },
  { key: 'amenAgilitySetup',    label: 'Agility Setup',            icon: '🏃', value: 'agility_setup'                      },
  { key: 'amenAntiTick',        label: 'Anti-Tick Treatment',      icon: '🪲', value: 'anti_tick_treatment'                 },
  { key: 'amenCageFree',        label: 'Cage Free',                icon: '🔓', value: 'cage_free'                          },
  { key: 'amenCooler',          label: 'Cooler',                   icon: '💨', value: 'cooler'                             },
  { key: 'amenCustomizedMeals', label: 'Customized Meals',         icon: '🍽️', value: 'customized_meals'                   },
  { key: 'amenDailyCleaning',   label: 'Daily Cleaning',           icon: '🧹', value: 'daily_cleanings'                    },
  { key: 'amenLiveUpdate',      label: 'Daily Real-time Updates',  icon: '📱', value: 'daily_real_time_stamped_photo_video' },
  { key: 'amenDryDogFood',      label: 'Dry Dog Food',             icon: '🦴', value: 'dry_dog_food'                       },
  { key: 'amenExtendedHours',   label: 'Extended Hours',           icon: '⏰', value: 'extended_hours'                     },
  { key: 'amenFreshWater',      label: 'Fresh Drinking Water',     icon: '💧', value: 'fresh_drinking_water'               },
  { key: 'amenGlassDoors',      label: 'Glass Doors',              icon: '🚪', value: 'glass_doors'                        },
  { key: 'amenGrooming',        label: 'Grooming',                 icon: '✂️', value: 'grooming'                           },
  { key: 'amenHomeFood',        label: 'Home Food',                icon: '🍱', value: 'home_food'                          },
  { key: 'amenIndividualCage',  label: 'Individual Cage',          icon: '🏠', value: 'individual_cage'                    },
  { key: 'amenPersonalBeds',    label: 'Personal Beds',            icon: '🛏️', value: 'personal_beds'                      },
  { key: 'amenPetCafe',         label: 'Pet Cafe',                 icon: '☕', value: 'pet_cafe'                           },
  { key: 'amenPetMusic',        label: 'Pet Friendly Music',       icon: '🎵', value: 'pet_friendly_music'                 },
  { key: 'amenPetStore',        label: 'Pet Store',                icon: '🏪', value: 'pet_store'                          },
  { key: 'amenPickDrop',        label: 'Pick & Drop',              icon: '🚗', value: 'pick_and_drop_facility'             },
  { key: 'amenPlayArea',        label: 'Play Areas',               icon: '🎾', value: 'play_areas'                         },
  { key: 'amenPlushBlankets',   label: 'Plush Blankets',           icon: '🛌', value: 'plush_blankets'                     },
  { key: 'amenLeashWalks',      label: 'Scheduled Leash Walks',    icon: '🦮', value: 'scheduled_leash_walks'              },
  { key: 'amenSoloAttention',   label: 'Solo Attention',           icon: '👤', value: 'solo_attention'                     },
  { key: 'amenSpa',             label: 'Spa',                      icon: '🛁', value: 'spa'                                },
  { key: 'amenSwimming',        label: 'Swimming',                 icon: '🏊', value: 'swimming'                           },
  { key: 'amenVaccinationOnly', label: 'Vaccinated Pets Only',     icon: '💉', value: 'vaccinated_pets_only'               },
  { key: 'amenVegMeal',         label: 'Veg Meals',                icon: '🥗', value: 'veg_meals'                          },
  { key: 'amenVetSupport',      label: 'Veterinary Support',       icon: '🏥', value: 'veterinary_support'                 },
]

const PET_TYPES = [
  { key: 'petDogs',  prefix: 'dog',   icon: '🐕', title: 'Dogs',       desc: 'All breeds & sizes',       hasSizes: true  },
  { key: 'petCats',  prefix: 'cat',   icon: '🐈', title: 'Cats',       desc: 'Indoor & outdoor cats',    hasSizes: false },
  { key: 'petBirds', prefix: 'bird',  icon: '🦜', title: 'Birds',      desc: 'Parrots, parakeets, etc.', hasSizes: false },
  { key: 'petSmall', prefix: 'small', icon: '🐾', title: 'Small Pets', desc: 'Guinea pigs, hamsters…',   hasSizes: false },
]

const INITIAL_FORM = {
  // Step 1 — locked after submit
  propertyName: '',
  streetAddress: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  businessType: '',
  ownershipType: '',
  aboutBusiness: '',

  // Pets — editable
  petDogs: false, petCats: false, petBirds: false, petSmall: false,

  // Dog details + pricing
  dogCapacityPerDay: '', dogNumRooms: '', dogRoomArea: '',
  dogNumCages: '', dogCageLength: '', dogCageBreadth: '', dogCageHeight: '',
  priceDogSmall: '', priceDogMedium: '', priceDogLarge: '',

  // Cat details + pricing
  catCapacityPerDay: '', catNumRooms: '', catRoomArea: '',
  catNumCages: '', catCageLength: '', catCageBreadth: '', catCageHeight: '',
  priceCat: '',

  // Bird details + pricing
  birdCapacityPerDay: '', birdNumRooms: '', birdRoomArea: '',
  birdNumCages: '', birdCageLength: '', birdCageBreadth: '', birdCageHeight: '',
  priceBird: '',

  // Small pet details + pricing
  smallCapacityPerDay: '', smallNumRooms: '', smallRoomArea: '',
  smallNumCages: '', smallCageLength: '', smallCageBreadth: '', smallCageHeight: '',
  priceSmall: '',

  // Services — editable
  svcBoarding: false, svcEmergency: false,

  // Step 2 — locked after submit
  businessName: '',
  stayLimitation: '', propertyAreaSize: '', caretakersCount: '',
  experience: '',
  rules: '',

  // Amenities — editable (matches backend list)
  amenCCTV: false,            amenCCTVFree: true,            amenCCTVPrice: '',            amenCCTVDesc: '',
  amenAC: false,              amenACFree: true,              amenACPrice: '',              amenACDesc: '',
  amenAgilitySetup: false,    amenAgilitySetupFree: true,    amenAgilitySetupPrice: '',    amenAgilitySetupDesc: '',
  amenAntiTick: false,        amenAntiTickFree: true,        amenAntiTickPrice: '',        amenAntiTickDesc: '',
  amenCageFree: false,        amenCageFreeFree: true,        amenCageFreePrice: '',        amenCageFreeDesc: '',
  amenCooler: false,          amenCoolerFree: true,          amenCoolerPrice: '',          amenCoolerDesc: '',
  amenCustomizedMeals: false, amenCustomizedMealsFree: true, amenCustomizedMealsPrice: '', amenCustomizedMealsDesc: '',
  amenDailyCleaning: false,   amenDailyCleaningFree: true,   amenDailyCleaningPrice: '',   amenDailyCleaningDesc: '',
  amenLiveUpdate: false,      amenLiveUpdateFree: true,      amenLiveUpdatePrice: '',      amenLiveUpdateDesc: '',
  amenDryDogFood: false,      amenDryDogFoodFree: true,      amenDryDogFoodPrice: '',      amenDryDogFoodDesc: '',
  amenExtendedHours: false,   amenExtendedHoursFree: true,   amenExtendedHoursPrice: '',   amenExtendedHoursDesc: '',
  amenFreshWater: false,      amenFreshWaterFree: true,      amenFreshWaterPrice: '',      amenFreshWaterDesc: '',
  amenGlassDoors: false,      amenGlassDoorsFree: true,      amenGlassDoorsPrice: '',      amenGlassDoorsDesc: '',
  amenGrooming: false,        amenGroomingFree: true,        amenGroomingPrice: '',        amenGroomingDesc: '',
  amenHomeFood: false,        amenHomeFoodFree: true,        amenHomeFoodPrice: '',        amenHomeFoodDesc: '',
  amenIndividualCage: false,  amenIndividualCageFree: true,  amenIndividualCagePrice: '',  amenIndividualCageDesc: '',
  amenPersonalBeds: false,    amenPersonalBedsFree: true,    amenPersonalBedsPrice: '',    amenPersonalBedsDesc: '',
  amenPetCafe: false,         amenPetCafeFree: true,         amenPetCafePrice: '',         amenPetCafeDesc: '',
  amenPetMusic: false,        amenPetMusicFree: true,        amenPetMusicPrice: '',        amenPetMusicDesc: '',
  amenPetStore: false,        amenPetStoreFree: true,        amenPetStorePrice: '',        amenPetStoreDesc: '',
  amenPickDrop: false,        amenPickDropFree: true,        amenPickDropPrice: '',        amenPickDropDesc: '',
  amenPlayArea: false,        amenPlayAreaFree: true,        amenPlayAreaPrice: '',        amenPlayAreaDesc: '',
  amenPlushBlankets: false,   amenPlushBlanketsFree: true,   amenPlushBlanketsPrice: '',   amenPlushBlanketsDesc: '',
  amenLeashWalks: false,      amenLeashWalksFree: true,      amenLeashWalksPrice: '',      amenLeashWalksDesc: '',
  amenSoloAttention: false,   amenSoloAttentionFree: true,   amenSoloAttentionPrice: '',   amenSoloAttentionDesc: '',
  amenSpa: false,             amenSpaFree: true,             amenSpaPrice: '',             amenSpaDesc: '',
  amenSwimming: false,        amenSwimmingFree: true,        amenSwimmingPrice: '',        amenSwimmingDesc: '',
  amenVaccinationOnly: false, amenVaccinationOnlyFree: true, amenVaccinationOnlyPrice: '', amenVaccinationOnlyDesc: '',
  amenVegMeal: false,         amenVegMealFree: true,         amenVegMealPrice: '',         amenVegMealDesc: '',
  amenVetSupport: false,      amenVetSupportFree: true,      amenVetSupportPrice: '',      amenVetSupportDesc: '',

  // Step 3 — locked after submit
  idPhotoFront: null, idPhotoBack: null,
  addressProof: null, nocFile: null,
  gomastaProof: null, udyamProof: null, gstProof: null,
  // Document URLs hydrated from the API (get-by-id) for display in view/edit.
  idPhotoFrontUrl: '', idPhotoBackUrl: '',
  addressProofUrl: '', nocFileUrl: '',
  gomastaProofUrl: '', udyamProofUrl: '', gstProofUrl: '',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RadioCard({ selected, onClick, icon, title, desc, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border-2 transition-all w-full ${
        selected ? 'border-secondary bg-secondary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <p className={`font-bold text-sm ${selected ? 'text-secondary' : 'text-gray-800'}`}>{title}</p>
      {desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>}
      {badge && <span className="mt-2 inline-block text-xs px-2 py-0.5 bg-primary/20 text-yellow-700 rounded-full font-semibold">{badge}</span>}
    </button>
  )
}

function CheckCard({ checked, onChange, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        checked ? 'border-secondary bg-secondary/5' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
            checked ? 'bg-secondary border-secondary' : 'border-gray-300'
          }`}
          style={{ width: 17, height: 17 }}
        >
          {checked && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
        <div>
          <p className="text-xl mb-0.5">{icon}</p>
          <p className={`font-semibold text-sm ${checked ? 'text-secondary' : 'text-gray-800'}`}>{title}</p>
          {desc && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>}
        </div>
      </div>
    </button>
  )
}

function PriceInput({ label, value, onChange, placeholder, error }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₹</span>
        <input
          type="number" min={0}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-7 pr-3 py-3 border rounded-xl text-sm outline-none transition-all ${
            error
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">⚠ {error}</p>}
    </div>
  )
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-gray-900">{children}</h3>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function FileUploadBox({ label, hint, preview, onChange, onRemove, error, required }) {
  return (
    <div>
      {label && <FieldLabel required={required}>{label}</FieldLabel>}
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      <div className={preview ? 'relative max-w-xs' : ''}>
        <label className="block cursor-pointer">
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onChange} />
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-secondary shadow-sm group">
              <img src={preview} alt="" className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Upload size={16} className="text-white" />
                <span className="text-white text-xs font-semibold">Change file</span>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-4 border-2 border-dashed rounded-2xl p-5 hover:border-secondary hover:bg-secondary/5 transition-all ${error ? 'border-red-400' : 'border-gray-300'}`}>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Upload size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF · max 5 MB</p>
              </div>
            </div>
          )}
        </label>
        {preview && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove file"
            className="absolute top-1.5 right-1.5 z-10 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center transition-colors hover:bg-red-500"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">⚠ {error}</p>}
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function ReadField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl min-h-[40px]">
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function ViewSection({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
      <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
        {Icon && <Icon size={15} className="text-secondary shrink-0" />}
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep(step, f) {
  const e = {}
  if (step === 1) {
    if (!f.propertyName.trim())       e.propertyName   = 'Business owner name is required'
    if (!f.streetAddress.trim())      e.streetAddress  = 'Street address is required'
    if (!f.area.trim())               e.area           = 'Area / locality is required'
    if (!f.city)                      e.city           = 'Please select your city'
    if (!f.state)                     e.state          = 'Please select your state'
    if (!/^\d{6}$/.test(f.pincode))  e.pincode        = 'Enter a valid 6-digit pincode'
    if (!f.businessType)              e.businessType   = 'Please select your Stay type'
    if (!f.ownershipType)             e.ownershipType  = 'Please select property ownership'
    if (!f.petDogs && !f.petCats && !f.petBirds && !f.petSmall)
      e.petTypes = 'Select at least one pet type'
    PET_TYPES.forEach(({ key, prefix, hasSizes }) => {
      if (f[key]) {
        if (!f[`${prefix}CapacityPerDay`]) e[`${prefix}Capacity`]    = 'Capacity per day is required'
        if (!f[`${prefix}NumRooms`])       e[`${prefix}NumRooms`]    = 'Number of rooms is required'
        if (!f[`${prefix}RoomArea`])       e[`${prefix}RoomArea`]    = 'Room area is required'
        if (!f[`${prefix}NumCages`])       e[`${prefix}NumCages`]    = 'Number of cages is required'
        if (!f[`${prefix}CageLength`])     e[`${prefix}CageLength`]  = 'Length is required'
        if (!f[`${prefix}CageBreadth`])    e[`${prefix}CageBreadth`] = 'Breadth is required'
        if (!f[`${prefix}CageHeight`])     e[`${prefix}CageHeight`]  = 'Height is required'
        if (hasSizes) {
          if (!f.priceDogSmall)  e.priceDogSmall  = 'Price required'
          if (!f.priceDogMedium) e.priceDogMedium = 'Price required'
          if (!f.priceDogLarge)  e.priceDogLarge  = 'Price required'
        } else {
          if (prefix === 'cat'   && !f.priceCat)   e.priceCat   = 'Price required'
          if (prefix === 'bird'  && !f.priceBird)  e.priceBird  = 'Price required'
          if (prefix === 'small' && !f.priceSmall) e.priceSmall = 'Price required'
        }
      }
    })
    if (!f.svcBoarding && !f.svcEmergency)
      e.services = 'Select at least one service'
  }
  if (step === 2) {
    if (!f.businessName.trim())  e.businessName    = 'Business name is required'
    if (!f.caretakersCount)      e.caretakersCount = 'Number of caretakers is required'
    if (f.experience.trim().length < 30) e.experience = 'Please write at least 30 characters'
  }
  if (step === 3) {
    if (!f.idPhotoFront)  e.idPhotoFront  = 'Please upload Aadhaar Card front'
    if (!f.idPhotoBack)   e.idPhotoBack   = 'Please upload Aadhaar Card back'
    if (!f.addressProof)  e.addressProof  = 'Please upload at least one Address Proof'
  }
  return e
}

function validateEdit(f) {
  const e = {}
  if (!f.petDogs && !f.petCats && !f.petBirds && !f.petSmall)
    e.petTypes = 'Select at least one pet type'
  PET_TYPES.forEach(({ key, prefix, hasSizes }) => {
    if (f[key]) {
      if (!f[`${prefix}CapacityPerDay`]) e[`${prefix}Capacity`]    = 'Capacity per day is required'
      if (!f[`${prefix}NumRooms`])       e[`${prefix}NumRooms`]    = 'Number of rooms is required'
      if (!f[`${prefix}RoomArea`])       e[`${prefix}RoomArea`]    = 'Room area is required'
      if (!f[`${prefix}NumCages`])       e[`${prefix}NumCages`]    = 'Number of cages is required'
      if (!f[`${prefix}CageLength`])     e[`${prefix}CageLength`]  = 'Length is required'
      if (!f[`${prefix}CageBreadth`])    e[`${prefix}CageBreadth`] = 'Breadth is required'
      if (!f[`${prefix}CageHeight`])     e[`${prefix}CageHeight`]  = 'Height is required'
      if (hasSizes) {
        if (!f.priceDogSmall)  e.priceDogSmall  = 'Price required'
        if (!f.priceDogMedium) e.priceDogMedium = 'Price required'
        if (!f.priceDogLarge)  e.priceDogLarge  = 'Price required'
      } else {
        if (prefix === 'cat'   && !f.priceCat)   e.priceCat   = 'Price required'
        if (prefix === 'bird'  && !f.priceBird)  e.priceBird  = 'Price required'
        if (prefix === 'small' && !f.priceSmall) e.priceSmall = 'Price required'
      }
    }
  })
  if (!f.svcBoarding && !f.svcEmergency)
    e.services = 'Select at least one service'
  return e
}

// Builds the boarding / pricing / services / amenities portion of the host
// payload from form state. Shared by create (POST /api/host/add) and edit
// (PUT /api/host/put/:id) so the two stay in sync and produce identical shapes.
function buildBoardingData(form) {
  const boardingOfPets = []
  const capacity = []
  const numberOfRooms = {}
  const sizeOfRooms = []
  const sizeOfCages = []
  const pricePerPet = []

  PET_TYPES.forEach(({ key, prefix }) => {
    if (!form[key]) return
    const petType = prefix === 'dog' ? 'Dog' : prefix === 'cat' ? 'Cat' : prefix === 'bird' ? 'Bird' : 'smallPet'
    boardingOfPets.push(petType)
    capacity.push({ petType, capacity: Number(form[`${prefix}CapacityPerDay`]) || 0 })
    numberOfRooms[petType] = {
      room: Number(form[`${prefix}NumRooms`]) || 0,
      cage: Number(form[`${prefix}NumCages`]) || 0,
    }
    sizeOfRooms.push({ petType, area: Number(form[`${prefix}RoomArea`]) || 0 })
    sizeOfCages.push({
      petType,
      length:  Number(form[`${prefix}CageLength`])  || 0,
      breadth: Number(form[`${prefix}CageBreadth`]) || 0,
      height:  Number(form[`${prefix}CageHeight`])  || 0,
    })
    if (prefix === 'dog') {
      pricePerPet.push({
        petType,
        small:  { price: Number(form.priceDogSmall)  || 0 },
        medium: { price: Number(form.priceDogMedium) || 0 },
        large:  { price: Number(form.priceDogLarge)  || 0 },
      })
    } else {
      const price = prefix === 'cat'   ? Number(form.priceCat)   || 0
                  : prefix === 'bird'  ? Number(form.priceBird)  || 0
                  : prefix === 'small' ? Number(form.priceSmall) || 0
                  : 0
      pricePerPet.push({ petType, price })
    }
  })

  const Services = []
  if (form.svcBoarding)  Services.push('overnight_multiday_boarding')
  if (form.svcEmergency) Services.push('emergency_boarding')

  const amenities = []
  const paidAmenities = []
  FREE_AMENITIES.forEach(({ key, value }) => {
    if (!form[key]) return
    amenities.push(value)
    const isFree = form[`${key}Free`] !== false
    if (!isFree && form[`${key}Price`]) {
      paidAmenities.push({ amenitie: value, price: Number(form[`${key}Price`]), info: form[`${key}Desc`] || '' })
    }
  })

  return { boardingOfPets, capacity, numberOfRooms, sizeOfRooms, sizeOfCages, pricePerPet, Services, amenities, paidAmenities }
}

// Downscale + re-encode an image File so uploads stay well under the server's
// request-body limit (Vercel serverless caps at ~4.5 MB total per request, not
// per file). The source image can be any size — we shrink it to fit `maxBytes`.
// Non-images (PDFs) and already-small files pass through untouched. Returns JPEG.
async function compressImage(file, { maxDim = 1600, quality = 0.72, maxBytes = 800 * 1024 } = {}) {
  if (!file || !file.type?.startsWith('image/')) return file
  try {
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result)
      r.onerror = rej
      r.readAsDataURL(file)
    })
    const img = await new Promise((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = dataUrl
    })

    const encode = (dim, q) => {
      const scale = Math.min(1, dim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      return new Promise(res => canvas.toBlob(res, 'image/jpeg', q))
    }

    let dim = maxDim
    let blob = null
    // First bring the file under budget by dropping quality; if the quality
    // floor still isn't enough (very large source), also shrink the dimensions
    // and retry. This guarantees the output fits `maxBytes` for any input.
    for (let attempt = 0; attempt < 6; attempt++) {
      let q = quality
      blob = await encode(dim, q)
      while (blob && blob.size > maxBytes && q > 0.4) {
        q -= 0.15
        blob = await encode(dim, q)
      }
      if (blob && blob.size <= maxBytes) break
      dim = Math.round(dim * 0.75) // still too big → smaller dimensions
    }

    if (!blob) return file
    if (blob.size >= file.size) return file // never make a file bigger
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file // on any failure, fall back to the original file
  }
}

// Map a host record from the API into the flat form shape used by this page.
// This is the single source of truth for populating the form — values are read
// from the API response, never from localStorage.
function mapHostToForm(h) {
  // Address may be a structured object (newer API) or a legacy comma-joined string.
  // area/state default to '' since they're only present in the structured form.
  let area = '', state = ''
  let streetAddress, city, pincode
  if (h.address && typeof h.address === 'object') {
    streetAddress = h.address.street  || ''
    area          = h.address.area    || ''
    city          = h.address.city    || ''
    state         = h.address.state   || ''
    pincode       = h.address.pincode || ''
  } else {
    const addrParts = (h.address || '').split(',').map(s => s.trim())
    pincode       = addrParts[addrParts.length - 1] || ''
    city          = addrParts[addrParts.length - 2] || ''
    streetAddress = addrParts.slice(0, addrParts.length - 2).join(', ')
  }
  const pets    = h.boardingOfPets || []
  const cap     = (h.capacity     || []).reduce((a, c) => ({ ...a, [c.petType]: c.capacity }), {})
  const rooms   = h.numberOfRooms || {}
  const rSizes  = (h.sizeOfRooms  || []).reduce((a, r) => ({ ...a, [r.petType]: r.area }), {})
  const cSizes  = (h.sizeOfCages  || []).reduce((a, c) => ({ ...a, [c.petType]: c }), {})
  const dogP    = (h.pricePerPet  || []).find(p => p.petType === 'Dog')      || {}
  const catP    = (h.pricePerPet  || []).find(p => p.petType === 'Cat')      || {}
  const birdP   = (h.pricePerPet  || []).find(p => p.petType === 'Bird')     || {}
  const smallP  = (h.pricePerPet  || []).find(p => p.petType === 'smallPet') || {}
  const paidMap = (h.paidAmenities || []).reduce((a, x) => ({ ...a, [x.amenitie]: x }), {})
  // Document URLs — the API returns these as arrays (idProof[front,back],
  // addressProof[url], noc[url], businessProof[gomasta,udyam,gst]). Accept a flat
  // `*Url` string, a plain string, or the first item of an array.
  const arr    = v => (Array.isArray(v) ? v : v ? [v] : [])
  const asUrl  = v => (typeof v === 'string' ? v : '')
  const idProof       = arr(h.idProof)
  const addressProof  = arr(h.addressProof)
  const noc           = arr(h.noc)
  const businessProof = arr(h.businessProof)
  const docs = {
    idPhotoFrontUrl: h.idPhotoFrontUrl || asUrl(idProof[0]),
    idPhotoBackUrl:  h.idPhotoBackUrl  || asUrl(idProof[1]),
    addressProofUrl: h.addressProofUrl || asUrl(addressProof[0]),
    nocFileUrl:      h.nocFileUrl      || asUrl(noc[0]),
    gomastaProofUrl: h.gomastaProofUrl || asUrl(businessProof[0]),
    udyamProofUrl:   h.udyamProofUrl   || asUrl(businessProof[1]),
    gstProofUrl:     h.gstProofUrl     || asUrl(businessProof[2]),
  }
  const amenFields = {}
  FREE_AMENITIES.forEach(({ key, value }) => {
    const on   = (h.amenities || []).includes(value)
    const paid = paidMap[value]
    amenFields[key]              = on
    amenFields[`${key}Free`]     = !paid
    amenFields[`${key}Price`]    = paid?.price || ''
    amenFields[`${key}Desc`]     = paid?.info  || ''
  })
  return {
    ...INITIAL_FORM,
    propertyName: h.propertyName || '', streetAddress, area, city, state, pincode,
    businessType:  (h.bussinessType || '').toLowerCase() === 'homestay' ? 'homestay' : 'professional',
    ownershipType: (h.propertyType  || '').toLowerCase() === 'owned'    ? 'owned'    : 'rented',
    aboutBusiness: h.aboutBusiness || h.about || '',
    experience: h.experienceWithPets || '', rules: h.rule || '',
    businessName: h.nameOfBusiness || '', stayLimitation: h.limitationsForGuests || '',
    propertyAreaSize: h.propertyAreaSize || '', caretakersCount: h.numberOfCareTakers || '',
    petDogs: pets.includes('Dog'), petCats: pets.includes('Cat'),
    petBirds: pets.includes('Bird'), petSmall: pets.includes('smallPet'),
    dogCapacityPerDay: cap['Dog'] || '',   catCapacityPerDay:  cap['Cat']      || '',
    birdCapacityPerDay: cap['Bird'] || '',  smallCapacityPerDay: cap['smallPet'] || '',
    dogNumRooms:  rooms['Dog']?.room  || '', dogNumCages:  rooms['Dog']?.cage  || '',
    catNumRooms:  rooms['Cat']?.room  || '', catNumCages:  rooms['Cat']?.cage  || '',
    birdNumRooms: rooms['Bird']?.room || '', birdNumCages: rooms['Bird']?.cage || '',
    smallNumRooms: rooms['smallPet']?.room || '', smallNumCages: rooms['smallPet']?.cage || '',
    dogRoomArea: rSizes['Dog'] || '', catRoomArea: rSizes['Cat'] || '',
    birdRoomArea: rSizes['Bird'] || '', smallRoomArea: rSizes['smallPet'] || '',
    dogCageLength: cSizes['Dog']?.length || '', dogCageBreadth: cSizes['Dog']?.breadth || '', dogCageHeight: cSizes['Dog']?.height || '',
    catCageLength: cSizes['Cat']?.length || '', catCageBreadth: cSizes['Cat']?.breadth || '', catCageHeight: cSizes['Cat']?.height || '',
    birdCageLength: cSizes['Bird']?.length || '', birdCageBreadth: cSizes['Bird']?.breadth || '', birdCageHeight: cSizes['Bird']?.height || '',
    smallCageLength: cSizes['smallPet']?.length || '', smallCageBreadth: cSizes['smallPet']?.breadth || '', smallCageHeight: cSizes['smallPet']?.height || '',
    priceDogSmall: dogP.small?.price || '', priceDogMedium: dogP.medium?.price || '', priceDogLarge: dogP.large?.price || '',
    priceCat: catP.price || '', priceBird: birdP.price || '', priceSmall: smallP.price || '',
    svcBoarding:  (h.Services || []).includes('overnight_multiday_boarding'),
    svcEmergency: (h.Services || []).includes('emergency_boarding'),
    hostId: h._id || h.id, hostStatus: h.status || '', ...docs, ...amenFields,
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyForm() {
  const navigate = useNavigate()
  const { user, setRole, logout } = useAuth()

  const storeKey = `hostProperty_${user?.id || 'guest'}`

  const savedProperty = (() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || 'null') }
    catch { return null }
  })()

  const [isEditMode, setIsEditMode]   = useState(!!savedProperty)
  // True whenever we're going to fetch the listing from the API, so we show a
  // loader instead of a flash of empty/stale fields. When signed in but without
  // a known hostId we still verify — the effect resolves it from the API so an
  // existing listing shows up after a fresh login / on a new device.
  const [verifyingHost, setVerifyingHost] = useState(
    !!(user?.hostId || savedProperty?.hostId || (user?.id && localStorage.getItem('token')))
  )

  const [step, setStep]               = useState(1)
  // Form values are hydrated from the API (see the effect below), not from
  // localStorage. localStorage is only used to know a listing exists / its id.
  const [form, setForm]               = useState(INITIAL_FORM)
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]       = useState(false)
  const [propertyPhotoFiles, setPropertyPhotoFiles] = useState([])
  // Photo URLs always come from the API, never localStorage — uploaded files
  // don't serialize to localStorage, so it can't be a source of truth here.
  const [existingPhotoUrls,  setExistingPhotoUrls]  = useState([])
  const [openPetAccordions, setOpenPetAccordions] = useState({ dog: true })
  const [isViewingProperty, setIsViewingProperty] = useState(true)

  // Document previews are hydrated from the API (see effect below), not localStorage.
  const [idFrontPreview,       setIdFrontPreview]       = useState(null)
  const [idBackPreview,        setIdBackPreview]         = useState(null)
  const [addressProofPreview,  setAddressProofPreview]  = useState(null)
  const [nocFilePreview,       setNocFilePreview]        = useState(null)
  const [gomastaPreview,       setGomastaPreview]        = useState(null)
  const [udyamPreview,         setUdyamPreview]          = useState(null)
  const [gstPreview,           setGstPreview]            = useState(null)

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  // Persist the saved-property payload. Uploaded document previews are stored as
  // data-URLs so they survive submit / re-entry; if that overflows the storage
  // quota we retry without them rather than lose the whole record.
  const persistProperty = (payload) => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(payload))
    } catch {
      const slim = { ...payload }
      Object.keys(slim).forEach(k => { if (k.endsWith('Url') && typeof slim[k] === 'string' && slim[k].startsWith('data:')) delete slim[k] })
      try { localStorage.setItem(storeKey, JSON.stringify(slim)) } catch { /* give up quietly */ }
    }
  }

  // Single source of truth: hydrate the whole form (all field values + photos)
  // from the API whenever we have a listing id. localStorage is never used for
  // display — it only tells us which listing to fetch.
  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')

    const hydrate = (h) => {
      if (cancelled) return
      if (!h || (!h._id && !h.id)) {
        // Listing no longer exists on the server — drop the stale local hint.
        localStorage.removeItem(storeKey)
        setIsEditMode(false)
        setForm(INITIAL_FORM)
        return
      }
      const restored = mapHostToForm(h)
      // Persist only the lightweight hint (id + name) so we know a listing
      // exists on next load; the values themselves always come from the API.
      persistProperty({ hostId: restored.hostId, propertyName: restored.propertyName, submittedAt: new Date().toLocaleDateString('en-IN') })
      setForm(restored)
      setExistingPhotoUrls(h.propertyPhotos || h.photos || [])
      // Document previews come from the API too — populate the upload cards.
      setIdFrontPreview(restored.idPhotoFrontUrl || null)
      setIdBackPreview(restored.idPhotoBackUrl || null)
      setAddressProofPreview(restored.addressProofUrl || null)
      setNocFilePreview(restored.nocFileUrl || null)
      setGomastaPreview(restored.gomastaProofUrl || null)
      setUdyamPreview(restored.udyamProofUrl || null)
      setGstPreview(restored.gstProofUrl || null)
      setIsEditMode(true)
    }

    ;(async () => {
      // Resolve the listing id: known hint first, else look it up from the API
      // so an existing listing is found after a fresh login / on a new device.
      let hostId = user?.hostId || savedProperty?.hostId
      if (!hostId && user?.id) hostId = await resolveHostIdForUser(user.id, token)
      if (cancelled) return
      if (!hostId) { setVerifyingHost(false); return }
      try {
        const res = await axios.get(`/api/host/get/${hostId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        hydrate(res.data)
      } catch {
        // Don't clear localStorage on network error — keep the existing hint.
      }
    })().finally(() => { if (!cancelled) setVerifyingHost(false) })

    return () => { cancelled = true }
  }, [user?.hostId, user?.id])

  const handlePhotoInput = (e, previewSetter, formKey) => {
    const file = e.target.files?.[0]
    if (!file) return
    previewSetter(URL.createObjectURL(file))
    set(formKey, file)
    // Keep a persisted data-URL preview so the upload survives form submit /
    // re-entry (File objects don't survive localStorage serialization).
    if (file.type?.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => set(`${formKey}Url`, reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = (previewSetter, formKey) => {
    previewSetter(null)
    set(formKey, null)
    set(`${formKey}Url`, null)
  }

  const fieldCls = (err) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
      err
        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
    }`

  // ── Per-pet accordion details ─────────────────────────────────────────────

  const allClosed = () => Object.fromEntries(PET_TYPES.map(pt => [pt.prefix, false]))

  const togglePetAccordion = (prefix) =>
    setOpenPetAccordions(p => ({ ...allClosed(), [prefix]: !p[prefix] }))

  const handlePetToggle = (petKey, prefix, val) => {
    set(petKey, val)
    if (val) setOpenPetAccordions({ ...allClosed(), [prefix]: true })
    else     setOpenPetAccordions(p => ({ ...p, [prefix]: false }))
  }

  const renderPetDetails = ({ prefix, icon, title, hasSizes }) => {
    const isOpen = !!openPetAccordions[prefix]
    return (
      <div className="mt-3 border-2 border-secondary/20 rounded-2xl overflow-hidden">
        {/* Accordion header */}
        <button
          type="button"
          onClick={() => togglePetAccordion(prefix)}
          className="w-full flex items-center justify-between px-4 py-3 bg-secondary/8 hover:bg-secondary/12 transition-colors"
          style={{ background: isOpen ? 'rgba(var(--color-secondary-rgb,67,97,238),0.08)' : 'rgba(var(--color-secondary-rgb,67,97,238),0.04)' }}
        >
          <span className="flex items-center gap-1.5 text-sm font-bold text-secondary min-w-0">
            <span className="text-base leading-none shrink-0">{icon}</span>
            <span className="leading-normal truncate">{title} Boarding Details</span>
          </span>
          <ChevronDown
            size={16}
            className="text-secondary shrink-0 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {/* Accordion body */}
        {isOpen && (
          <div className="p-4 sm:p-5 bg-white space-y-4">
            <div className="max-w-[200px]">
              <FieldLabel required>Capacity per Day</FieldLabel>
              <input
                type="number" min={1}
                value={form[`${prefix}CapacityPerDay`]}
                onChange={e => set(`${prefix}CapacityPerDay`, e.target.value)}
                placeholder="e.g. 5"
                className={fieldCls(errors[`${prefix}Capacity`])}
              />
              {errors[`${prefix}Capacity`] && <p className="text-red-500 text-xs mt-1">⚠ {errors[`${prefix}Capacity`]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <FieldLabel required>Number of Rooms</FieldLabel>
                <input type="number" min={0} value={form[`${prefix}NumRooms`]}
                  onChange={e => set(`${prefix}NumRooms`, e.target.value)} placeholder="e.g. 2" className={fieldCls(errors[`${prefix}NumRooms`])} />
                {errors[`${prefix}NumRooms`] && <p className="text-red-500 text-xs mt-1">⚠ {errors[`${prefix}NumRooms`]}</p>}
              </div>

              <div>
                <FieldLabel required>Room Size (sq ft)</FieldLabel>
                <input type="number" min={0} value={form[`${prefix}RoomArea`]}
                  onChange={e => set(`${prefix}RoomArea`, e.target.value)} placeholder="e.g. 400"
                  className={fieldCls(errors[`${prefix}RoomArea`])} />
                {errors[`${prefix}RoomArea`] && <p className="text-red-500 text-xs mt-1">⚠ {errors[`${prefix}RoomArea`]}</p>}
              </div>
            </div>

            <div>
              <div className="max-w-[200px] mb-3">
                <FieldLabel required>Number of Cages</FieldLabel>
                <input type="number" min={0} value={form[`${prefix}NumCages`]}
                  onChange={e => set(`${prefix}NumCages`, e.target.value)} placeholder="e.g. 3" className={fieldCls(errors[`${prefix}NumCages`])} />
                {errors[`${prefix}NumCages`] && <p className="text-red-500 text-xs mt-1">⚠ {errors[`${prefix}NumCages`]}</p>}
              </div>
              <FieldLabel required>Cage Size</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Length (ft)',  fkey: `${prefix}CageLength`  },
                  { label: 'Breadth (ft)', fkey: `${prefix}CageBreadth` },
                  { label: 'Height (ft)',  fkey: `${prefix}CageHeight`  },
                ].map(({ label, fkey }) => (
                  <div key={fkey}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <input type="number" min={0} value={form[fkey]}
                      onChange={e => set(fkey, e.target.value)} placeholder="e.g. 3" className={fieldCls(errors[fkey])} />
                    {errors[fkey] && <p className="text-red-500 text-xs mt-1">⚠ {errors[fkey]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-3">💰 Pricing (per night)</p>
              {hasSizes ? (
                <div className="grid grid-cols-3 gap-2">
                  <PriceInput label="Small (<18 kg)"    value={form.priceDogSmall}  onChange={v => set('priceDogSmall', v)}  placeholder="499" error={errors.priceDogSmall} />
                  <PriceInput label="Medium (18–45 kg)" value={form.priceDogMedium} onChange={v => set('priceDogMedium', v)} placeholder="649" error={errors.priceDogMedium} />
                  <PriceInput label="Large (>46 kg)"    value={form.priceDogLarge}  onChange={v => set('priceDogLarge', v)}  placeholder="799" error={errors.priceDogLarge} />
                </div>
              ) : (
                <div className="max-w-[180px]">
                  {prefix === 'cat'   && <PriceInput label="Per cat per night"  value={form.priceCat}   onChange={v => set('priceCat', v)}   placeholder="549" error={errors.priceCat} />}
                  {prefix === 'bird'  && <PriceInput label="Per bird per night" value={form.priceBird}  onChange={v => set('priceBird', v)}  placeholder="349" error={errors.priceBird} />}
                  {prefix === 'small' && <PriceInput label="Per pet per night"  value={form.priceSmall} onChange={v => set('priceSmall', v)} placeholder="199" error={errors.priceSmall} />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Amenities ─────────────────────────────────────────────────────────────

  const renderAmenities = () => {
    const selected = FREE_AMENITIES.filter(({ key }) => form[key])
    return (
      <div className="space-y-6">
        <div>
          <SectionTitle sub="Select all amenities included in your standard rate">Amenities</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FREE_AMENITIES.map(({ key, label, icon }) => {
              const checked = form[key]
              return (
                <button key={key} type="button" onClick={() => set(key, !checked)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    checked ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    checked ? 'bg-secondary border-secondary' : 'border-gray-300'
                  }`} style={{ width: 16, height: 16 }}>
                    {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {selected.length > 0 && (
          <div>
            <SectionTitle sub="Choose Free or set a price — paid amenities appear at customer checkout">Amenity Pricing</SectionTitle>
            <div className="space-y-2">
              {selected.map(({ key, label, icon }) => {
                const freeKey  = key + 'Free'
                const priceKey = key + 'Price'
                const descKey  = key + 'Desc'
                const isFree   = form[freeKey] !== false
                return (
                  <div key={key} className={`rounded-xl border-2 transition-all ${
                    isFree ? 'border-green-200 bg-green-50' : 'border-primary/60 bg-primary/5'
                  }`}>
                    <div className="flex items-center gap-3 p-3">
                      <span className="text-lg leading-none shrink-0">{icon}</span>
                      <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button"
                          onClick={() => { set(freeKey, true); set(priceKey, ''); set(descKey, '') }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                            isFree ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 text-gray-500 hover:border-green-300'
                          }`}
                        >Free</button>
                        <div className="w-24">
                          <PriceInput
                            value={form[priceKey]}
                            onChange={v => { set(priceKey, v); set(freeKey, !v) }}
                            placeholder="Price"
                          />
                        </div>
                      </div>
                    </div>
                    {!isFree && (
                      <div className="px-3 pb-3">
                        <input
                          type="text"
                          maxLength={80}
                          value={form[descKey]}
                          onChange={e => set(descKey, e.target.value)}
                          placeholder="Short description and conditions"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 bg-white"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Green = Free · Yellow = Paid add-on at checkout</p>
          </div>
        )}
      </div>
    )
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const errs = validateStep(step, form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      if (step === 1) {
        const opens = {}
        PET_TYPES.forEach(({ key, prefix }) => { if (form[key]) opens[prefix] = true })
        setOpenPetAccordions(opens)
      }
      return
    }
    setErrors({})
    if (step === 3) {
      setSubmitting(true)
      try {
        const data = {
          userId: user?.id,
          propertyName: form.propertyName,
          address: {
            street:  form.streetAddress,
            area:    form.area,
            city:    form.city,
            state:   form.state,
            pincode: form.pincode,
          },
          about: form.aboutBusiness || form.experience || '',
          bussinessType: form.businessType === 'homestay' ? 'Homestay' : 'Professional',
          propertyType: form.ownershipType === 'owned' ? 'Owned' : 'Rented',
          aboutBusiness: form.aboutBusiness || form.experience || '',
          ...buildBoardingData(form),
          nameOfBusiness: form.businessName,
          limitationsForGuests: Number(form.stayLimitation) || 0,
          propertyAreaSize: Number(form.propertyAreaSize) || 0,
          numberOfCareTakers: Number(form.caretakersCount) || 0,
          experienceWithPets: form.experience,
          rule: form.rules,
        }

        console.log('[FULL DATA]', JSON.stringify(data, null, 2))

        const fd = new FormData()
        fd.append('data', JSON.stringify(data))

        // Compress images before upload so the whole request stays under the
        // server's ~4.5 MB body limit (otherwise the backend returns 413). The
        // budget is shared across ALL images, so we divide it by the number of
        // image files — this keeps the total under the cap for any source size
        // or photo count, at the cost of lower quality when there are many.
        const imageFiles = [
          form.addressProof, form.idPhotoFront, form.idPhotoBack, form.nocFile,
          form.gomastaProof, form.udyamProof, form.gstProof, ...propertyPhotoFiles,
        ].filter(f => f && f.type?.startsWith('image/'))
        const TOTAL_BUDGET = 3.8 * 1024 * 1024 // leave headroom for JSON + overhead
        const perFile = Math.max(250 * 1024, Math.floor(TOTAL_BUDGET / Math.max(1, imageFiles.length)))
        const opts = { maxBytes: perFile }

        const [
          addressProofC, idFrontC, idBackC, nocC, gomastaC, udyamC, gstC,
        ] = await Promise.all([
          compressImage(form.addressProof, opts), compressImage(form.idPhotoFront, opts),
          compressImage(form.idPhotoBack, opts), compressImage(form.nocFile, opts),
          compressImage(form.gomastaProof, opts), compressImage(form.udyamProof, opts),
          compressImage(form.gstProof, opts),
        ])
        const photosC = await Promise.all(propertyPhotoFiles.map(f => compressImage(f, opts)))

        const allFiles = [
          addressProofC, idFrontC, idBackC, nocC, gomastaC, udyamC, gstC, ...photosC,
        ].filter(Boolean)
        const totalBytes = allFiles.reduce((sum, f) => sum + (f.size || 0), 0)
        // Safety net — should rarely trigger now that the budget is adaptive.
        if (totalBytes > 4.3 * 1024 * 1024) {
          toast.error(`Uploads total ${(totalBytes / 1024 / 1024).toFixed(1)} MB even after compression. Please remove a few photos and try again.`)
          setSubmitting(false)
          return
        }

        if (addressProofC) fd.append('addressProof', addressProofC)
        if (idFrontC)      fd.append('idProof', idFrontC)
        if (idBackC)       fd.append('idProof', idBackC)
        if (nocC)          fd.append('noc', nocC)
        if (gomastaC)      fd.append('businessProof', gomastaC)
        if (udyamC)        fd.append('businessProof', udyamC)
        if (gstC)          fd.append('businessProof', gstC)
        photosC.forEach(file => fd.append('propertyPhotos', file))

        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_BASE}/api/host/add`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const toSave = { ...form, submittedAt: new Date().toLocaleDateString('en-IN') }

        const hostId = response.data?.HostId || response.data?.id || response.data?.hostId || response.data?.data?.id

        if (response.data?.message === 'host already exists') {
          // Backend didn't return hostId — find it from the list by matching address
          try {
            const listRes = await axios.get('/api/host/get', { headers: { Authorization: `Bearer ${token}` } })
            const list = Array.isArray(listRes.data) ? listRes.data : listRes.data?.data || []
            const existing = list.find(h => h.address === data.address || h.propertyName === data.propertyName)
            persistProperty({ ...toSave, hostId: existing?.id })
          } catch {
            persistProperty(toSave)
          }
          toast('Your listing is already submitted — pending verification.', { icon: 'ℹ️' })
        } else {
          persistProperty({ ...toSave, hostId })
          toast.success('Listing submitted! Pending verification 🎉')
        }
        // Form submitted → promote the user to host so the dashboard/sidebar unlocks.
        if (user?.role !== 'host') setRole('host')
        navigate('/host/dashboard')
      } catch (err) {
        const errData = err.response?.data
        const status  = err.response?.status
        console.error('=== API ERROR ===')
        console.error('Status:', status)
        console.error('Full response:', JSON.stringify(errData, null, 2))
        if (Array.isArray(errData?.errors)) {
          errData.errors.forEach((e, i) => console.error(`Error[${i}] field="${e?.field}" message="${e?.message}" code="${e?.code}"`))
        }
        console.error('=================')

        // Session expired or token missing — log out and redirect to login.
        if (status === 401 || status === 403) {
          toast.error('Your session has expired. Please log in again.', { duration: 5000 })
          logout()
          navigate('/login', { replace: true })
          return
        }

        const toStr = (v) => {
          if (!v) return null
          if (typeof v === 'string') return v
          if (typeof v === 'object') return v.message || v.msg || v.error || JSON.stringify(v)
          return String(v)
        }
        const validationMsg = Array.isArray(errData?.errors)
          ? errData.errors.map(e => {
              const field = e?.field || e?.path || ''
              const msg   = e?.message || e?.msg || toStr(e)
              return field ? `[${field}]: ${msg}` : msg
            }).filter(Boolean).join(' | ')
          : null
        const msg = validationMsg
          || toStr(errData?.message)
          || toStr(errData?.error)
          || toStr(errData)
          || 'Submission failed. Please try again.'
        toast.error(msg, { duration: 6000 })
      } finally {
        setSubmitting(false)
      }
      return
    }
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleBack = () => { setErrors({}); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'instant' }) }

  // ── Edit mode save ────────────────────────────────────────────────────────

  const handleEditSave = async () => {
    const errs = validateEdit(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const opens = {}
      PET_TYPES.forEach(({ key, prefix }) => { if (form[key]) opens[prefix] = true })
      setOpenPetAccordions(opens)
      toast.error('Please fill all required fields before saving.')
      return
    }

    const existing = JSON.parse(localStorage.getItem(storeKey) || '{}')
    const hostId = existing?.hostId || savedProperty?.hostId || user?.hostId
    if (!hostId) {
      toast.error('Could not find your listing id. Please refresh and try again.')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const boardingData = buildBoardingData(form)
      // If the host added new photos, send them as multipart using the same
      // `propertyPhotos` file param as the add flow. The kept existing photo URLs
      // travel inside `data.propertyPhotos` so the backend knows which to retain.
      if (propertyPhotoFiles.length > 0) {
        // Compress new photos so the request stays under the server body limit.
        // Share the budget across the photos being uploaded.
        const perFile = Math.max(250 * 1024, Math.floor((3.8 * 1024 * 1024) / propertyPhotoFiles.length))
        const photosC = await Promise.all(propertyPhotoFiles.map(f => compressImage(f, { maxBytes: perFile })))
        const fd = new FormData()
        fd.append('data', JSON.stringify({ ...boardingData, propertyPhotos: existingPhotoUrls }))
        photosC.forEach(file => fd.append('propertyPhotos', file))
        await axios.put(`${API_BASE}/api/host/put/${hostId}`, fd, {
          params: { userId: user?.id },
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        // No new files — send the boarding JSON plus the kept photo URLs so
        // removals persist too.
        await axios.put(
          `${API_BASE}/api/host/put/${hostId}`,
          { ...boardingData, propertyPhotos: existingPhotoUrls },
          {
            params: { userId: user?.id },
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      }
      // Re-fetch from the API so the freshly uploaded photos (and any removals)
      // show with their real server URLs — the API is the source of truth.
      try {
        const res = await axios.get(`/api/host/get/${hostId}`, { headers: { Authorization: `Bearer ${token}` } })
        const h = res.data
        if (h && (h._id || h.id)) {
          setForm(mapHostToForm(h))
          setExistingPhotoUrls(h.propertyPhotos || h.photos || [])
        }
      } catch { /* keep current state if the refresh fails */ }
      setPropertyPhotoFiles([])
      toast.success('Listing updated successfully!')
      setIsViewingProperty(true)
    } catch (err) {
      const errData = err.response?.data
      const msg = errData?.message || errData?.error || errData?.msg
      toast.error(typeof msg === 'string' ? msg : 'Update failed. Please try again.', { duration: 6000 })
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW MODE — same form layout, all fields disabled
  // ─────────────────────────────────────────────────────────────────────────

  if (verifyingHost) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  )

  if (isEditMode && isViewingProperty) {
    const dis = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 cursor-default'
    const disPriceInput = (val) => (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
        <input readOnly disabled value={val} className={`${dis} pl-7`} />
      </div>
    )
    const docStatus = (label, val) => (
      <div key={label} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
        val ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
      }`}>
        {val ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
        {label}
      </div>
    )

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-extrabold text-gray-900">{form.propertyName}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {[form.streetAddress, form.area, form.city, form.state].filter(Boolean).join(', ')}{form.pincode ? ` — ${form.pincode}` : ''}
              </p>
              {form.hostStatus !== 'verified' && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                  <span className="text-xs font-semibold text-yellow-700">Pending Verification</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsViewingProperty(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 transition-all shadow-sm shrink-0"
            >
              <Edit3 size={14} />
              Edit Property
            </button>
          </div>
        </div>

        {/* ── Step 1 content (disabled) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Building2 size={14} className="text-primary" />
            </div>
            <p className="font-bold text-gray-800 text-sm">About</p>
          </div>

          <div className="pointer-events-none space-y-5">
            <div>
              <FieldLabel>Business owner name</FieldLabel>
              <input readOnly disabled value={form.propertyName} className={dis} />
            </div>
            <div>
              <FieldLabel>Street Address</FieldLabel>
              <input readOnly disabled value={form.streetAddress || ''} className={dis} />
            </div>
            <div>
              <FieldLabel>Area / Locality</FieldLabel>
              <input readOnly disabled value={form.area || ''} className={dis} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>City</FieldLabel>
                <input readOnly disabled value={form.city} className={dis} />
              </div>
              <div>
                <FieldLabel>State</FieldLabel>
                <input readOnly disabled value={form.state || ''} className={dis} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Pincode</FieldLabel>
                <input readOnly disabled value={form.pincode} className={dis} />
              </div>
            </div>

            <div>
              <FieldLabel>Stay Type</FieldLabel>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <RadioCard selected={form.businessType === 'homestay'}  onClick={() => {}} icon="🏠" title="Homestay"     desc="Personal residence." badge="Most popular" />
                <RadioCard selected={form.businessType === 'professional'} onClick={() => {}} icon="🏢" title="Professional" desc="Dedicated facility." />
              </div>
            </div>

            <div>
              <FieldLabel>Property Type</FieldLabel>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <RadioCard selected={form.ownershipType === 'owned'}  onClick={() => {}} icon="🔑" title="Owned"  desc="You own this property." />
                <RadioCard selected={form.ownershipType === 'rented'} onClick={() => {}} icon="📋" title="Rented" desc="You rent this property." />
              </div>
            </div>

            {form.aboutBusiness ? (
              <div>
                <FieldLabel>About Yourself / Business</FieldLabel>
                <textarea readOnly disabled value={form.aboutBusiness} rows={3} className={`${dis} resize-none`} />
              </div>
            ) : null}

            {/* Pets */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Pets you host">Which pets do you accept?</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PET_TYPES.map(pt => <CheckCard key={pt.key} checked={form[pt.key]} onChange={() => {}} icon={pt.icon} title={pt.title} desc={pt.desc} />)}
              </div>
              <div className="mt-4 space-y-3">
                {PET_TYPES.filter(pt => form[pt.key]).map(({ prefix, icon, title, hasSizes }) => (
                  <div key={prefix} className="border-2 border-secondary/20 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-secondary/5 border-b border-secondary/10 flex items-center gap-2">
                      <span className="text-base leading-none shrink-0">{icon}</span>
                      <span className="text-sm font-bold text-secondary leading-normal">{title} Boarding Details</span>
                    </div>
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Capacity per Day</FieldLabel>
                          <input readOnly disabled value={form[`${prefix}CapacityPerDay`]} placeholder="—" className={dis} />
                        </div>
                        <div>
                          <FieldLabel>Number of Rooms</FieldLabel>
                          <input readOnly disabled value={form[`${prefix}NumRooms`]} placeholder="—" className={dis} />
                        </div>
                        <div>
                          <FieldLabel>Room Size (sq ft)</FieldLabel>
                          <input readOnly disabled value={form[`${prefix}RoomArea`]} placeholder="—" className={dis} />
                        </div>
                        <div>
                          <FieldLabel>Number of Cages</FieldLabel>
                          <input readOnly disabled value={form[`${prefix}NumCages`]} placeholder="—" className={dis} />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Cage Size</FieldLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Length (ft)',  fkey: `${prefix}CageLength`  },
                            { label: 'Breadth (ft)', fkey: `${prefix}CageBreadth` },
                            { label: 'Height (ft)',  fkey: `${prefix}CageHeight`  },
                          ].map(({ label, fkey }) => (
                            <div key={fkey}>
                              <p className="text-xs text-gray-500 mb-1">{label}</p>
                              <input readOnly disabled value={form[fkey]} placeholder="—" className={dis} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm font-bold text-gray-700 mb-3">💰 Pricing (per night)</p>
                        {hasSizes ? (
                          <div className="grid grid-cols-3 gap-2">
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Small (&lt;10 kg)</label>{disPriceInput(form.priceDogSmall)}</div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Medium (10–25 kg)</label>{disPriceInput(form.priceDogMedium)}</div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Large (&gt;25 kg)</label>{disPriceInput(form.priceDogLarge)}</div>
                          </div>
                        ) : (
                          <div className="max-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Per night</label>
                            {prefix === 'cat'   && disPriceInput(form.priceCat)}
                            {prefix === 'bird'  && disPriceInput(form.priceBird)}
                            {prefix === 'small' && disPriceInput(form.priceSmall)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Services offered">What services will you offer?</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'svcBoarding',  icon: '🏡', title: 'Overnight / Multiday Boarding', desc: 'Pets stay overnight with full care.' },
                  { key: 'svcEmergency', icon: '⚡', title: 'Emergency/Hourly Boarding',     desc: 'Accept last-minute & hourly requests.' },
                ].map(({ key, icon, title, desc }) => (
                  <CheckCard key={key} checked={form[key]} onChange={() => {}} icon={icon} title={title} desc={desc} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 2 content (disabled) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <FileText size={14} className="text-primary" />
            </div>
            <p className="font-bold text-gray-800 text-sm">Business Details</p>
          </div>

          <div className="pointer-events-none space-y-5">
            <div>
              <FieldLabel>Name of Business</FieldLabel>
              <input readOnly disabled value={form.businessName} placeholder="—" className={dis} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Stay Limitation for Guests</FieldLabel>
                <input readOnly disabled value={form.stayLimitation} placeholder="—" className={dis} />
              </div>
              <div>
                <FieldLabel>Property Area Size</FieldLabel>
                <input readOnly disabled value={form.propertyAreaSize} placeholder="—" className={dis} />
              </div>
            </div>
            <div className="max-w-xs">
              <FieldLabel>Number of Caretakers at Property for Pet</FieldLabel>
              <input readOnly disabled value={form.caretakersCount} placeholder="—" className={dis} />
            </div>
            <div>
              <FieldLabel>Your Experience with Pets</FieldLabel>
              <textarea readOnly disabled value={form.experience} rows={4} className={`${dis} resize-none`} />
            </div>
            {form.rules && (
              <div>
                <FieldLabel>Property Rules and information</FieldLabel>
                <textarea readOnly disabled value={form.rules} rows={3} className={`${dis} resize-none`} />
              </div>
            )}

            {/* Amenities */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Your selected amenities">Amenities</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {FREE_AMENITIES.map(({ key, label, icon }) => {
                  const checked = form[key]
                  return (
                    <div key={key} className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${
                      checked ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-400 bg-white'
                    }`}>
                      <div className={`shrink-0 rounded border-2 flex items-center justify-center ${
                        checked ? 'bg-secondary border-secondary' : 'border-gray-300'
                      }`} style={{ width: 16, height: 16 }}>
                        {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-base leading-none">{icon}</span>
                      <span className="text-xs font-medium leading-tight">{label}</span>
                    </div>
                  )
                })}
              </div>
              {FREE_AMENITIES.some(({ key }) => form[key]) && (
                <div className="space-y-2">
                  {FREE_AMENITIES.filter(({ key }) => form[key]).map(({ key, label, icon }) => {
                    const isFree = form[key + 'Free'] !== false
                    const price  = form[key + 'Price']
                    const desc   = form[key + 'Desc']
                    return (
                      <div key={key} className={`rounded-xl border-2 ${
                        isFree ? 'border-green-200 bg-green-50' : 'border-primary/60 bg-primary/5'
                      }`}>
                        <div className="flex items-center gap-3 p-3">
                          <span className="text-lg leading-none shrink-0">{icon}</span>
                          <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 ${
                            isFree ? 'border-green-500 bg-green-500 text-white' : 'border-primary/60 bg-primary/10 text-yellow-700'
                          }`}>
                            {isFree ? 'Free' : `₹ ${price}`}
                          </span>
                        </div>
                        {!isFree && desc && (
                          <p className="px-3 pb-2.5 text-xs text-gray-500 italic">{desc}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Property photos">Property Photos</SectionTitle>
              {existingPhotoUrls.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {existingPhotoUrls.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-gray-900 px-1.5 py-0.5 rounded font-bold">Cover</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No photos uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 3 content (disabled) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Fingerprint size={14} className="text-primary" />
            </div>
            <p className="font-bold text-gray-800 text-sm">Verification</p>
          </div>

          {form.hostStatus !== 'verified' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                <span className="text-sm font-bold text-yellow-700">Pending Verification</span>
              </div>
              <p className="text-xs text-yellow-600">House of boarding team reviews documents within 4-5 working days.</p>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 mb-3">Uploaded Documents</p>
          <div className="grid grid-cols-2 gap-2">
            {docStatus('Aadhaar Front',   form.idPhotoFront || form.idPhotoFrontUrl)}
            {docStatus('Aadhaar Back',    form.idPhotoBack  || form.idPhotoBackUrl)}
            {docStatus('Address Proof',   form.addressProof || form.addressProofUrl)}
            {docStatus('NOC / Landlord',  form.nocFile      || form.nocFileUrl)}
            {docStatus('Gomasta Lic.',    form.gomastaProof || form.gomastaProofUrl)}
            {docStatus('Udyam Reg.',      form.udyamProof   || form.udyamProofUrl)}
            {docStatus('GST Certificate', form.gstProof     || form.gstProofUrl)}
          </div>
        </div>

      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EDIT MODE
  // ─────────────────────────────────────────────────────────────────────────

  if (isEditMode) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Your Listing</h1>
          <p className="text-sm text-gray-500 mt-1">You can update pets, pricing, services, and amenities.</p>
        </div>

        {/* Locked info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">Locked — requires re-verification to change</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-amber-700">
            <div><span className="font-semibold">Property:</span> {form.propertyName}</div>
            <div><span className="font-semibold">City:</span> {form.city}{form.state ? `, ${form.state}` : ''} — {form.pincode}</div>
            <div className="sm:col-span-2"><span className="font-semibold">Address:</span> {[form.streetAddress, form.area].filter(Boolean).join(', ')}</div>
            <div><span className="font-semibold">Type:</span> {form.businessType} · {form.ownershipType}</div>
          </div>
          <p className="text-xs text-amber-500 mt-2 italic">Contact support to update locked details.</p>
        </div>

        <div className="space-y-5">
          {/* Pets */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <SectionTitle sub="Uncheck a pet to stop accepting them">Which pets do you accept?</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PET_TYPES.map(pt => (
                <CheckCard key={pt.key} checked={form[pt.key]}
                  onChange={v => handlePetToggle(pt.key, pt.prefix, v)}
                  icon={pt.icon} title={pt.title} desc={pt.desc} />
              ))}
            </div>
            {errors.petTypes && <p className="text-red-500 text-xs mt-3">⚠ {errors.petTypes}</p>}
            <div className="mt-4 space-y-3">
              {PET_TYPES.filter(pt => form[pt.key]).map(pt => (
                <div key={pt.key}>{renderPetDetails(pt)}</div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <SectionTitle sub="Check or uncheck to update your services">What services will you offer?</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'svcBoarding',  icon: '🏡', title: 'Overnight / Multiday Boarding', desc: 'Pets stay overnight with full care.' },
                { key: 'svcEmergency', icon: '⚡', title: 'Emergency/Hourly Boarding',     desc: 'Last-minute & hourly requests.' },
              ].map(({ key, icon, title, desc }) => (
                <CheckCard key={key} checked={form[key]} onChange={v => set(key, v)} icon={icon} title={title} desc={desc} />
              ))}
            </div>
            {errors.services && <p className="text-red-500 text-xs mt-3">⚠ {errors.services}</p>}
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            {renderAmenities()}
          </div>

          {/* Property Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <SectionTitle sub="Remove existing photos or upload new ones — at least 3 recommended">Property Photos</SectionTitle>

            <label className="block cursor-pointer mb-4">
              <input
                type="file" accept="image/*" multiple className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files)
                  setPropertyPhotoFiles(prev => [...prev, ...files])
                  e.target.value = ''
                }}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-secondary hover:bg-secondary/5 transition-all group">
                <div className="w-14 h-14 bg-gray-100 group-hover:bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload size={24} className="text-gray-400 group-hover:text-secondary transition-colors" />
                </div>
                <p className="font-semibold text-gray-700 group-hover:text-secondary transition-colors">Click to upload photos</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · max 5 MB each</p>
              </div>
            </label>

            {(existingPhotoUrls.length > 0 || propertyPhotoFiles.length > 0) && (
              <div className="grid grid-cols-3 gap-3">
                {existingPhotoUrls.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setExistingPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center transition-colors hover:bg-red-500">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-gray-900 px-1.5 py-0.5 rounded font-bold">Cover</span>}
                  </div>
                ))}
                {propertyPhotoFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setPropertyPhotoFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center transition-colors hover:bg-red-500">
                      <X size={12} />
                    </button>
                    {existingPhotoUrls.length === 0 && i === 0 && <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-gray-900 px-1.5 py-0.5 rounded font-bold">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => { setErrors({}); setIsViewingProperty(true) }}
            className="px-5 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleEditSave} disabled={submitting}
            className="flex items-center gap-2 px-7 py-3 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-60 transition-all shadow-sm">
            {submitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
              : <><Check size={16} />Save Changes</>
            }
          </button>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE MODE — 3-step form
  // ─────────────────────────────────────────────────────────────────────────

  const { icon: StepIcon, title: stepTitle, desc: stepDesc } = STEPS[step - 1]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-16">

      {/* Progress header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-sm">
              <StepIcon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Step {step} of 3</p>
              <h2 className="font-extrabold text-gray-900 text-base leading-tight">{stepTitle}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{stepDesc}</p>
            </div>
          </div>
          <span className="text-5xl font-black text-gray-100 select-none leading-none tabular-nums mt-1">
            {String(step).padStart(2, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Step circles */}
        <div className="flex items-center justify-between">
          {STEPS.map((s) => {
            const done = s.id < step
            const cur  = s.id === step
            return (
              <button
                key={s.id}
                type="button"
                title={s.title}
                onClick={() => done && setStep(s.id)}
                className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all focus:outline-none ${
                  done
                    ? 'bg-secondary text-white cursor-pointer hover:opacity-90'
                    : cur
                    ? 'bg-primary text-gray-900 ring-2 ring-primary/40 ring-offset-2'
                    : 'bg-gray-100 text-gray-400 cursor-default'
                }`}
              >
                {done ? <Check size={13} strokeWidth={3} /> : s.id}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-5">

        {/* ── STEP 1: About ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <FieldLabel required>Business owner name</FieldLabel>
              <input value={form.propertyName} onChange={e => set('propertyName', e.target.value)}
                placeholder="e.g. John Smith" className={fieldCls(errors.propertyName)} />
              {errors.propertyName && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.propertyName}</p>}
            </div>

            <div>
              <FieldLabel required>Street Address</FieldLabel>
              <input value={form.streetAddress} onChange={e => set('streetAddress', e.target.value)}
                placeholder="e.g. 42, 8th Cross"
                className={fieldCls(errors.streetAddress)} />
              {errors.streetAddress && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.streetAddress}</p>}
            </div>

            <div>
              <FieldLabel required>Area / Locality</FieldLabel>
              <input value={form.area} onChange={e => set('area', e.target.value)}
                placeholder="e.g. Koramangala 3rd Block"
                className={fieldCls(errors.area)} />
              {errors.area && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.area}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>City</FieldLabel>
                <select value={form.city} onChange={e => set('city', e.target.value)}
                  className={`${fieldCls(errors.city)} appearance-none cursor-pointer`}>
                  <option value="">Select city…</option>
                  {INDIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.city}</p>}
              </div>
              <div>
                <FieldLabel required>State</FieldLabel>
                <select value={form.state} onChange={e => set('state', e.target.value)}
                  className={`${fieldCls(errors.state)} appearance-none cursor-pointer`}>
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>Pincode</FieldLabel>
                <input type="text" inputMode="numeric" maxLength={6}
                  value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                  placeholder="560034" className={fieldCls(errors.pincode)} />
                {errors.pincode && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.pincode}</p>}
              </div>
            </div>

            <div>
              <FieldLabel required>Stay Type</FieldLabel>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <RadioCard selected={form.businessType === 'homestay'} onClick={() => set('businessType', 'homestay')}
                  icon="🏠" title="Homestay"
                  desc="Personal residence. Pets stay in your living space with individual attention."
                  badge="Most popular" />
                <RadioCard selected={form.businessType === 'professional'} onClick={() => set('businessType', 'professional')}
                  icon="🏢" title="Professional"
                  desc="Dedicated facility with staff, grooming, and structured multi-pet operations." />
              </div>
              {errors.businessType && <p className="text-red-500 text-xs mt-2">⚠ {errors.businessType}</p>}
            </div>

            <div>
              <FieldLabel required>Property Type</FieldLabel>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <RadioCard selected={form.ownershipType === 'owned'} onClick={() => set('ownershipType', 'owned')}
                  icon="🔑" title="Owned"
                  desc="You own this property and have full rights to run a boarding service here." />
                <RadioCard selected={form.ownershipType === 'rented'} onClick={() => set('ownershipType', 'rented')}
                  icon="📋" title="Rented"
                  desc="You rent this property. Ensure your lease permits commercial pet boarding." />
              </div>
              {errors.ownershipType && <p className="text-red-500 text-xs mt-2">⚠ {errors.ownershipType}</p>}
            </div>

            <div>
              <FieldLabel>About Yourself / Business <span className="text-gray-400 font-normal text-xs">(optional)</span></FieldLabel>
              <p className="text-xs text-gray-500 mb-1.5">Shown to customers on your profile.</p>
              <textarea value={form.aboutBusiness} onChange={e => set('aboutBusiness', e.target.value)}
                placeholder="Tell pet owners about yourself, your experience, your property environment…" rows={3}
                className={`${fieldCls()} resize-none`} />
            </div>

            {/* Which pets */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Select all pets you can host — fill details for each">Which pets do you accept?</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PET_TYPES.map(pt => (
                  <CheckCard key={pt.key} checked={form[pt.key]}
                    onChange={v => handlePetToggle(pt.key, pt.prefix, v)}
                    icon={pt.icon} title={pt.title} desc={pt.desc} />
                ))}
              </div>
              {errors.petTypes && <p className="text-red-500 text-xs mt-3">⚠ {errors.petTypes}</p>}

              <div className="mt-4 space-y-3">
                {PET_TYPES.filter(pt => form[pt.key]).map(pt => (
                  <div key={pt.key}>{renderPetDetails(pt)}</div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Select all that apply">What services will you offer?</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'svcBoarding',  icon: '🏡', title: 'Overnight / Multiday Boarding', desc: 'Pets stay overnight with full care.' },
                  { key: 'svcEmergency', icon: '⚡', title: 'Emergency/Hourly Boarding',     desc: 'Accept last-minute & hourly requests.' },
                ].map(({ key, icon, title, desc }) => (
                  <CheckCard key={key} checked={form[key]} onChange={v => set(key, v)} icon={icon} title={title} desc={desc} />
                ))}
              </div>
              {errors.services && <p className="text-red-500 text-xs mt-3">⚠ {errors.services}</p>}
            </div>
          </div>
        )}

        {/* ── STEP 2: Business Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle sub="Operations and facilities information">Business Details</SectionTitle>

            <div>
              <FieldLabel required>Name of Business</FieldLabel>
              <input value={form.businessName} onChange={e => set('businessName', e.target.value)}
                placeholder="e.g. Luxury pet hotel" className={fieldCls(errors.businessName)} />
              {errors.businessName && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.businessName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Stay Limitation for Guests</FieldLabel>
                <p className="text-xs text-gray-500 mb-1.5">Max number of days (if any)</p>
                <input value={form.stayLimitation} onChange={e => set('stayLimitation', e.target.value)}
                  placeholder="e.g. Max 30 days" className={fieldCls()} />
              </div>
              <div>
                <FieldLabel>Property Area Size</FieldLabel>
                <input value={form.propertyAreaSize} onChange={e => set('propertyAreaSize', e.target.value)}
                  placeholder="e.g. 1200 sq ft" className={fieldCls()} />
              </div>
            </div>

            <div>
              <FieldLabel required>Number of Caretakers at Property for Pet</FieldLabel>
              <input type="number" min={1} value={form.caretakersCount}
                onChange={e => set('caretakersCount', e.target.value)}
                placeholder="e.g. 2" className={fieldCls(errors.caretakersCount)} />
              {errors.caretakersCount && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.caretakersCount}</p>}
            </div>

            <div>
              <FieldLabel required>Your Experience with Pets</FieldLabel>
              <p className="text-xs text-gray-500 mb-2">Years of experience, training, certifications. Min 30 characters.</p>
              <textarea value={form.experience} onChange={e => set('experience', e.target.value)}
                rows={4} placeholder="e.g. 6 years of experience. Trained in pet first aid, hosted 100+ dogs and cats…"
                className={`${fieldCls(errors.experience)} resize-none`} />
              <div className="flex justify-between mt-1">
                {errors.experience ? <p className="text-red-500 text-xs">⚠ {errors.experience}</p> : <span />}
                <span className={`text-xs ${form.experience.length < 30 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.experience.length} / 30 min
                </span>
              </div>
            </div>

            <div>
              <FieldLabel>Property Rules and information</FieldLabel>
              <p className="text-xs text-gray-500 mb-1.5">House rules, pet guidelines, or restrictions guests should know</p>
              <textarea value={form.rules} onChange={e => set('rules', e.target.value)}
                placeholder="e.g. No aggressive pets, must be vaccinated, no outdoor access after 9pm etc. Note: must mention number of pets owned by property and kids at property" rows={3}
                className={`${fieldCls()} resize-none`} />
            </div>

            {/* Amenities */}
            <div className="pt-4 border-t border-gray-100">
              {renderAmenities()}
            </div>

            {/* Property Photos */}
            <div className="pt-4 border-t border-gray-100">
              <SectionTitle sub="Add photos — listings with photos get 3× more bookings">Property Photos</SectionTitle>

              <label className="block cursor-pointer mb-4">
                <input
                  type="file" accept="image/*" multiple className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files)
                    setPropertyPhotoFiles(prev => [...prev, ...files])
                    e.target.value = ''
                  }}
                />
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-secondary hover:bg-secondary/5 transition-all group">
                  <div className="w-14 h-14 bg-gray-100 group-hover:bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Upload size={24} className="text-gray-400 group-hover:text-secondary transition-colors" />
                  </div>
                  <p className="font-semibold text-gray-700 group-hover:text-secondary transition-colors">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · max 5 MB each</p>
                </div>
              </label>

              {(existingPhotoUrls.length > 0 || propertyPhotoFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-3">
                  {existingPhotoUrls.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setExistingPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center transition-colors hover:bg-red-500">
                        <X size={12} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-gray-900 px-1.5 py-0.5 rounded font-bold">Cover</span>}
                    </div>
                  ))}
                  {propertyPhotoFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setPropertyPhotoFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center transition-colors hover:bg-red-500">
                        <X size={12} />
                      </button>
                      {existingPhotoUrls.length === 0 && i === 0 && <span className="absolute bottom-1.5 left-1.5 text-xs bg-primary text-gray-900 px-1.5 py-0.5 rounded font-bold">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Verification ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm font-semibold">🔒 Documents are encrypted and secure</p>
              <p className="text-amber-700 text-xs mt-0.5">Used only by the House of boarding Trust & Safety team for host verification.</p>
            </div>

            <FileUploadBox
              label="Upload Aadhaar Card — Front"
              hint="Clear photo or scan of the front side of your Aadhaar Card."
              preview={idFrontPreview}
              required
              error={errors.idPhotoFront}
              onChange={e => handlePhotoInput(e, setIdFrontPreview, 'idPhotoFront')}
              onRemove={() => handleRemoveFile(setIdFrontPreview, 'idPhotoFront')}
            />

            <FileUploadBox
              label="Upload Aadhaar Card — Back"
              hint="Clear photo or scan of the back side of your Aadhaar Card."
              preview={idBackPreview}
              required
              error={errors.idPhotoBack}
              onChange={e => handlePhotoInput(e, setIdBackPreview, 'idPhotoBack')}
              onRemove={() => handleRemoveFile(setIdBackPreview, 'idPhotoBack')}
            />

            <FileUploadBox
              label="Address Proof"
              hint="Any one — Electric bill, Aadhaar, rent agreement, or similar document."
              preview={addressProofPreview}
              required
              onChange={e => handlePhotoInput(e, setAddressProofPreview, 'addressProof')}
              onRemove={() => handleRemoveFile(setAddressProofPreview, 'addressProof')}
            />

            <div className={form.businessType !== 'professional' ? '' : 'opacity-40 pointer-events-none'}>
              <FileUploadBox
                label="NOC of Neighbours / Landlord"
                hint="Required for homestay hosts — No Objection Certificate from neighbours or landlord."
                preview={nocFilePreview}
                onChange={e => handlePhotoInput(e, setNocFilePreview, 'nocFile')}
                onRemove={() => handleRemoveFile(setNocFilePreview, 'nocFile')}
              />
            </div>

            <div className={form.businessType === 'professional' ? '' : 'opacity-40 pointer-events-none'}>
              <FieldLabel>Business Proof</FieldLabel>
              <p className="text-xs text-gray-500 mb-3">Upload any or all applicable documents</p>
              <div className="space-y-3">
                {[
                  { label: 'Gomasta License',    preview: gomastaPreview, setter: setGomastaPreview, fkey: 'gomastaProof' },
                  { label: 'Udyam Registration', preview: udyamPreview,   setter: setUdyamPreview,   fkey: 'udyamProof'   },
                  { label: 'GST Certificate',    preview: gstPreview,     setter: setGstPreview,     fkey: 'gstProof'     },
                ].map(({ label, preview, setter, fkey }) => (
                  <div key={fkey}>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
                    <FileUploadBox preview={preview} onChange={e => handlePhotoInput(e, setter, fkey)} onRemove={() => handleRemoveFile(setter, fkey)} />
                  </div>
                ))}
              </div>
            </div>

            {form.hostStatus !== 'verified' && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Verification Status</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
                  <span className="text-sm font-bold text-yellow-700">Pending Verification</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">House of boarding team reviews documents within 4-5 working days.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={handleBack} disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={16} /> Previous
        </button>

        <button type="button" onClick={handleNext} disabled={submitting}
          className="flex items-center gap-2 px-7 py-3 bg-secondary text-white text-sm font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-60 transition-all shadow-sm">
          {submitting ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
          ) : step === 3 ? (
            <><Check size={16} />Submit Listing</>
          ) : (
            <>Next Step<ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}
