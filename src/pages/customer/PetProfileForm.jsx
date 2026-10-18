import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const YEARS = Array.from({ length: 11 }, (_, i) => 2026 - i)

const BEHAVIORAL_OPTIONS_BY_TYPE = {
  Dog:      ['None', 'Leash Pulling', 'Separation Anxiety', 'Fear', 'Destructive Chewing', 'Aggression', 'Other'],
  Cat:      ['None', 'Territorial', 'Shy', 'Food Aggression', 'Litter Box Problems', 'Aggression', 'Excessive Meowing', 'Other'],
  Bird:     ['Tamed', 'Untamed', 'Other'],
  smallPet: ['None', 'Aggression', 'Anxiety', 'Fear', 'Other'],
  default:  ['None', 'Aggression', 'Anxiety', 'Fear', 'Other'],
}

const inputClass =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary bg-white transition-all'
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

function RadioPill({ value, checked, onChange, label, disabled }) {
  return (
    <div
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={() => { if (!disabled) onChange({ target: { value } }) }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all select-none ${
        disabled
          ? checked
            ? 'border-secondary/40 bg-secondary/40 text-white cursor-not-allowed'
            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
          : checked
          ? 'border-secondary bg-secondary text-white cursor-pointer'
          : 'border-gray-200 text-gray-600 hover:border-secondary/40 cursor-pointer'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function DatePicker({ label, day, month, year, onDay, onMonth, onYear }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Day</p>
          <select value={day} onChange={(e) => onDay(e.target.value)} className={inputClass}>
            <option value="">Day</option>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Month</p>
          <select value={month} onChange={(e) => onMonth(e.target.value)} className={inputClass}>
            <option value="">Month</option>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Year</p>
          <select value={year} onChange={(e) => onYear(e.target.value)} className={inputClass}>
            <option value="">Year</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function PetProfileForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id: editId } = useParams()
  const location = useLocation()
  const isEdit = Boolean(editId)
  const [section, setSection] = useState(1)

  // Where to go when this form closes. If the user arrived from the booking
  // flow (via "Add Pet"), send them back to that same booking with the host
  // they had selected preserved — so they don't lose their place. Otherwise
  // fall back to the profile page.
  const returnTo =
    location.state?.from === 'booking' && location.state?.host
      ? { path: '/book', options: { state: { host: location.state.host } } }
      : { path: '/profile', options: undefined }
  const goBack = () => navigate(returnTo.path, returnTo.options)

  const [submitting, setSubmitting] = useState(false)

  // Section 1
  const [parentName, setParentName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [emailId, setEmailId] = useState('')
  const [address, setAddress] = useState('')
  const [s1Errors, setS1Errors] = useState({})

  // Section 2
  const [description, setDescription] = useState('')
  const [petType, setPetType] = useState('')
  const [petName, setPetName] = useState('')
  const [petAgeYears, setPetAgeYears] = useState('')
  const [petAgeMonths, setPetAgeMonths] = useState('')
  const [colourMarking, setColourMarking] = useState('')
  const [breed, setBreed] = useState('')
  const [gender, setGender] = useState('')
  const [weight, setWeight] = useState('')
  const [size, setSize] = useState('')

  const [vaccDay, setVaccDay] = useState('')
  const [vaccMonth, setVaccMonth] = useState('')
  const [vaccYear, setVaccYear] = useState('')

  const [tickTreatment, setTickTreatment] = useState('')
  const [tickDay, setTickDay] = useState('')
  const [tickMonth, setTickMonth] = useState('')
  const [tickYear, setTickYear] = useState('')

  const [healthIssues, setHealthIssues] = useState('')
  const [healthDesc, setHealthDesc] = useState('')

  const [medicalHistory, setMedicalHistory] = useState('')
  const [medicalDesc, setMedicalDesc] = useState('')

  const [behavioralIssues, setBehavioralIssues] = useState([])
  const [behavioralOtherDesc, setBehavioralOtherDesc] = useState('')

  const [loadingPet, setLoadingPet] = useState(isEdit)

  // Populate every field from an existing pet profile when editing.
  const prefill = (p) => {
    if (!p) return
    setParentName(p.name || '')
    setContactNumber(p.contactNumber || '')
    setEmailId(p.email || '')
    setAddress(p.addressPet || '')
    setPetType(p.petType || '')
    setPetName(p.petName || '')
    const totalMonths = p.petAge != null ? Number(p.petAge) : 0
    setPetAgeYears(totalMonths > 0 ? String(Math.floor(totalMonths / 12)) : '')
    setPetAgeMonths(totalMonths > 0 ? String(totalMonths % 12) : '')
    setColourMarking(p.colorAndMarkings || '')
    setBreed(p.breed || '')
    setGender(p.petGender || '')
    setSize(p.petSize || '')
    // Vaccination date (ISO, stored as UTC) → day / month-name / year selects.
    if (p.vacinationdate) {
      const d = new Date(p.vacinationdate)
      if (!isNaN(d)) {
        setVaccDay(String(d.getUTCDate()))
        setVaccMonth(MONTHS[d.getUTCMonth()])
        setVaccYear(String(d.getUTCFullYear()))
      }
    }
    setTickTreatment(p.tickTreatmentStatus ? 'Yes' : 'No')
    setHealthIssues(p.healthIssues ? 'Yes' : 'No')
    setHealthDesc(p.healthIssuesDescription || '')
    setMedicalHistory(p.medicalHistory ? 'Yes' : 'No')
    setMedicalDesc(p.medicalHistoryDescription || '')
    // Behavioural: reconstruct multi-select from comma-separated description.
    const opts = BEHAVIORAL_OPTIONS_BY_TYPE[p.petType] || BEHAVIORAL_OPTIONS_BY_TYPE.default
    if (!p.behavioralIssues) {
      setBehavioralIssues(['None'])
    } else if (p.behavioralIssuesDescription) {
      const parts = p.behavioralIssuesDescription.split(',').map(s => s.trim())
      const matched = parts.map(v => {
        const found = opts.find(o => o.toLowerCase() === v.toLowerCase())
        return found || 'Other'
      })
      const unique = [...new Set(matched)]
      setBehavioralIssues(unique)
      if (unique.includes('Other')) {
        const unknowns = parts.filter(v => !opts.find(o => o.toLowerCase() === v.toLowerCase()))
        setBehavioralOtherDesc(unknowns.join(', '))
      }
    } else {
      setBehavioralIssues(['None'])
    }
  }

  // On edit, load the pet: prefer the object passed via navigation state,
  // otherwise fetch the user's pets and find it by id.
  useEffect(() => {
    if (!isEdit) return
    let active = true
    const fromState = location.state?.pet
    if (fromState && String(fromState.id) === String(editId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      prefill(fromState)
      setLoadingPet(false)
      return
    }
    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/petProfile/get', {
          params: { userId: user?.id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const list = Array.isArray(res.data) ? res.data : res.data?.data || []
        const pet = list.find((x) => String(x.id) === String(editId))
        if (active) {
          if (pet) prefill(pet)
          else toast.error('Pet profile not found.')
        }
      } catch {
        if (active) toast.error('Could not load pet profile.')
      } finally {
        if (active) setLoadingPet(false)
      }
    })()
    return () => { active = false }
  }, [isEdit, editId]) // eslint-disable-line react-hooks/exhaustive-deps

  const validateSection1 = () => {
    const errs = {}
    if (!parentName.trim()) errs.parentName = 'Name is required'
    if (!contactNumber.trim()) errs.contactNumber = 'Contact number is required'
    if (!emailId.trim()) errs.emailId = 'Email is required'
    if (!address.trim()) errs.address = 'Address is required'
    setS1Errors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => {
    if (validateSection1()) {
      setSection(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Derive the dog size bucket from body weight (kg):
  //   < 18 kg → Small, 18–45 kg → Medium, > 45 kg → Large.
  const sizeFromWeight = (kg) => {
    const w = parseFloat(kg)
    if (isNaN(w)) return ''
    if (w < 18) return 'Small'
    if (w <= 45) return 'Medium'
    return 'Large'
  }

  // Build an ISO timestamp from the day / month-name / year selects.
  const toISODate = (day, monthName, year) => {
    if (!day || !monthName || !year) return null
    const monthIndex = MONTHS.indexOf(monthName)
    if (monthIndex < 0) return null
    return new Date(Date.UTC(Number(year), monthIndex, Number(day))).toISOString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const hasBehavioralIssue = behavioralIssues.length > 0 && !behavioralIssues.includes('None') && !behavioralIssues.includes('Tamed')
    const behavioralDescription = hasBehavioralIssue
      ? behavioralIssues.map(v => v === 'Other' ? behavioralOtherDesc || 'other' : v.toLowerCase()).join(',')
      : ''

    // Maps the form state to the petProfile/add API body.
    const payload = {
      name: parentName,
      contactNumber,
      email: emailId,
      addressPet: address,
      petType,
      petName,
      petAge: (parseInt(petAgeYears) || 0) * 12 + (parseInt(petAgeMonths) || 0),
      colorAndMarkings: colourMarking,
      breed,
      petGender: gender,
      // Size only applies to dogs — only include it for dogs so the backend
      // doesn't reject an empty value for other pet types.
      ...(petType === 'Dog' && size ? { petSize: size } : {}),
      vacinationdate: toISODate(vaccDay, vaccMonth, vaccYear),
      tickTreatmentStatus: tickTreatment === 'Yes',
      healthIssues: healthIssues === 'Yes',
      healthIssuesDescription: healthIssues === 'Yes' ? healthDesc : '',
      medicalHistory: medicalHistory === 'Yes',
      medicalHistoryDescription: medicalHistory === 'Yes' ? medicalDesc : '',
      behavioralIssues: hasBehavioralIssue,
      behavioralIssuesDescription: behavioralDescription,
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const params = { userId: user?.id }

      if (isEdit) {
        // Only these fields are editable — petType, colour/markings, breed and
        // gender are locked, so they're excluded from the update payload.
        const editPayload = {
          name: payload.name,
          contactNumber: payload.contactNumber,
          email: payload.email,
          addressPet: payload.addressPet,
          petName: payload.petName,
          petAge: payload.petAge,
          ...(size ? { petSize: size } : {}),
          vacinationdate: payload.vacinationdate,
          tickTreatmentStatus: payload.tickTreatmentStatus,
          healthIssues: payload.healthIssues,
          healthIssuesDescription: payload.healthIssuesDescription,
          medicalHistory: payload.medicalHistory,
          medicalHistoryDescription: payload.medicalHistoryDescription,
          behavioralIssues: payload.behavioralIssues,
          behavioralIssuesDescription: payload.behavioralIssuesDescription,
        }
        const res = await axios.put(`/api/petProfile/update/${editId}`, editPayload, { params, headers })
        toast.success(res.data?.message || 'Pet profile updated successfully!')
      } else {
        const res = await axios.post('/api/petProfile/add', payload, { params, headers })
        toast.success(res.data?.message || 'Pet profile created successfully!')
      }
      goBack()
    } catch (err) {
      console.error(isEdit ? '[petProfile/update]' : '[petProfile/add]', err)
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? 'update' : 'create'} pet profile. Please try again.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPet) {
    return (
      <div className="bg-gray-50 py-8 px-4 min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => (section === 2 ? setSection(1) : goBack())}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-secondary mb-5 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">{isEdit ? 'Edit Pet Profile' : 'Pet Profile'}</h1>
          <p className="text-gray-500 text-sm mt-1">Tell us about you and your pet</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-secondary">Section {section} of 2</span>
            <span className="text-xs text-gray-400">{section === 1 ? 'Parent Details' : 'Pet Profile'}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: section === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                section > 1 ? 'bg-green-500 text-white' : section === 1 ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {section > 1 ? <CheckCircle size={13} /> : '1'}
              </div>
              <span className={`text-xs font-semibold ${section >= 1 ? 'text-secondary' : 'text-gray-400'}`}>
                Parent Details
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                section >= 2 ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
              <span className={`text-xs font-semibold ${section >= 2 ? 'text-secondary' : 'text-gray-400'}`}>
                Pet Profile
              </span>
            </div>
          </div>
        </div>

        {/* ─── SECTION 1: Parent Details ─── */}
        {section === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                <span className="text-secondary font-extrabold text-sm">1</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Parent Details</h2>
                <p className="text-xs text-gray-400">Section 1 of 2</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={isEdit}
                  className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
                {s1Errors.parentName && (
                  <p className="text-red-500 text-xs mt-1">{s1Errors.parentName}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Contact number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter your mobile number"
                  disabled={isEdit}
                  className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
                {s1Errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{s1Errors.contactNumber}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Email id <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isEdit}
                  className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
                {s1Errors.emailId && (
                  <p className="text-red-500 text-xs mt-1">{s1Errors.emailId}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  disabled={isEdit}
                  className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                />
                {s1Errors.address && (
                  <p className="text-red-500 text-xs mt-1">{s1Errors.address}</p>
                )}
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors mt-2 shadow-sm"
              >
                Continue to next section
              </button>
            </div>
          </div>
        )}

        {/* ─── SECTION 2: Pet Profile ─── */}
        {section === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <span className="text-secondary font-extrabold text-sm">2</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Pet Profile</h2>
                  <p className="text-xs text-gray-400">Section 2 of 2</p>
                </div>
              </div>

              <div className="space-y-6">

                {/* Description */}
                <div>
                  <label className={labelClass}>
                    Description{' '}
                    <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell us something about your pet…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Pet Type — locked when editing */}
                <div>
                  <label className={labelClass}>
                    Pet type
                    {isEdit && <span className="text-gray-400 font-normal text-xs ml-1">(can't be changed)</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'Dog', label: 'Dog' },
                      { value: 'Cat', label: 'Cat' },
                      { value: 'Bird', label: 'Bird' },
                      { value: 'smallPet', label: 'Small Pet' },
                    ].map((t) => (
                      <RadioPill
                        key={t.value}
                        name="petType"
                        value={t.value}
                        checked={petType === t.value}
                        disabled={isEdit}
                        onChange={(e) => {
                          setPetType(e.target.value)
                          setBehavioralIssues([])
                          // Size/weight apply to dogs only — clear them otherwise.
                          if (e.target.value !== 'Dog') { setSize(''); setWeight('') }
                        }}
                        label={t.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Pet Name */}
                <div>
                  <label className={labelClass}>Pet name</label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter your pet's name"
                    className={inputClass}
                  />
                </div>

                {/* Pet Age */}
                <div>
                  <label className={labelClass}>Pet age</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Years</p>
                      <input
                        type="number"
                        min="0"
                        value={petAgeYears}
                        onChange={(e) => setPetAgeYears(e.target.value)}
                        placeholder="e.g. 2"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Months</p>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={petAgeMonths}
                        onChange={(e) => setPetAgeMonths(e.target.value)}
                        placeholder="e.g. 6"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Colour and Marking — locked when editing */}
                <div>
                  <label className={labelClass}>
                    Colour and marking
                    {isEdit && <span className="text-gray-400 font-normal text-xs ml-1">(can't be changed)</span>}
                  </label>
                  <input
                    type="text"
                    value={colourMarking}
                    onChange={(e) => setColourMarking(e.target.value)}
                    disabled={isEdit}
                    placeholder="e.g. Golden with white patch on chest"
                    className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  />
                </div>

                {/* Breed — locked when editing */}
                <div>
                  <label className={labelClass}>
                    Breed
                    {isEdit && <span className="text-gray-400 font-normal text-xs ml-1">(can't be changed)</span>}
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    disabled={isEdit}
                    placeholder="e.g. Beagle, Persian cat, Cockatiel, mix breed etc."
                    className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  />
                </div>

                {/* Gender — locked when editing */}
                <div>
                  <label className={labelClass}>
                    Gender
                    {isEdit && <span className="text-gray-400 font-normal text-xs ml-1">(can't be changed)</span>}
                  </label>
                  <div className="flex gap-2">
                    {['Male', 'Female'].map((g) => (
                      <RadioPill
                        key={g}
                        name="gender"
                        value={g}
                        checked={gender === g}
                        disabled={isEdit}
                        onChange={(e) => setGender(e.target.value)}
                        label={g}
                      />
                    ))}
                  </div>
                </div>

                {/* Weight & Size — only dogs are priced by size, so hide otherwise */}
                {petType === 'Dog' && (
                  <>
                    {/* Weight — drives the size selection automatically */}
                    <div>
                      <label className={labelClass}>Weight <span className="text-gray-400 font-normal text-xs">(in kg)</span></label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={weight}
                        onChange={(e) => {
                          const val = e.target.value
                          setWeight(val)
                          // Auto-pick the size bucket from the entered weight.
                          const auto = sizeFromWeight(val)
                          if (auto) setSize(auto)
                        }}
                        placeholder="e.g. 12.5"
                        className={inputClass}
                      />
                    </div>

                    {/* Size — auto-selected from weight, but still adjustable */}
                    <div>
                      <label className={labelClass}>Size</label>
                      <div className="flex gap-2">
                        {['Small', 'Medium', 'Large'].map((s) => (
                          <RadioPill
                            key={s}
                            name="size"
                            value={s}
                            checked={size === s}
                            onChange={(e) => setSize(e.target.value)}
                            label={s}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Vaccination Details */}
                <DatePicker
                  label="Vaccination details"
                  day={vaccDay} month={vaccMonth} year={vaccYear}
                  onDay={setVaccDay} onMonth={setVaccMonth} onYear={setVaccYear}
                />
                {(vaccDay || vaccMonth || vaccYear) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <span className="font-bold">Important:</span>{' '}
                      If your pet has been vaccinated, please carry the vaccination documents with you when visiting the host.
                    </p>
                  </div>
                )}

                {/* Tick Treatment */}
                <div>
                  <label className={labelClass}>Tick treatment previously done</label>
                  <div className="flex gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <RadioPill
                        key={opt}
                        name="tickTreatment"
                        value={opt}
                        checked={tickTreatment === opt}
                        onChange={(e) => setTickTreatment(e.target.value)}
                        label={opt}
                      />
                    ))}
                  </div>
                </div>

                {tickTreatment === 'Yes' && (
                  <DatePicker
                    label="Tick treatment last date"
                    day={tickDay} month={tickMonth} year={tickYear}
                    onDay={setTickDay} onMonth={setTickMonth} onYear={setTickYear}
                  />
                )}

                {/* Health Issues */}
                <div>
                  <label className={labelClass}>Health issues in last 30 days</label>
                  <div className="flex gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <RadioPill
                        key={opt}
                        name="healthIssues"
                        value={opt}
                        checked={healthIssues === opt}
                        onChange={(e) => setHealthIssues(e.target.value)}
                        label={opt}
                      />
                    ))}
                  </div>
                </div>

                {healthIssues === 'Yes' && (
                  <div>
                    <label className={labelClass}>Describe the health issue in last 30 days</label>
                    <textarea
                      value={healthDesc}
                      onChange={(e) => setHealthDesc(e.target.value)}
                      rows={3}
                      placeholder="Describe the health issue…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}

                {/* Medical History */}
                <div>
                  <label className={labelClass}>Medical history</label>
                  <div className="flex gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <RadioPill
                        key={opt}
                        name="medicalHistory"
                        value={opt}
                        checked={medicalHistory === opt}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        label={opt}
                      />
                    ))}
                  </div>
                </div>

                {medicalHistory === 'Yes' && (
                  <div>
                    <label className={labelClass}>
                      Mention if yes, describe the issue and medication
                    </label>
                    <textarea
                      value={medicalDesc}
                      onChange={(e) => setMedicalDesc(e.target.value)}
                      rows={3}
                      placeholder="Describe the medical history and current medication…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}

                {/* Behavioral Issue */}
                <div>
                  <label className={labelClass}>Behavioral issue</label>
                  <div className="space-y-2">
                    {(BEHAVIORAL_OPTIONS_BY_TYPE[petType] || BEHAVIORAL_OPTIONS_BY_TYPE.default).map((opt, i) => {
                      const selected = behavioralIssues.includes(opt)
                      const noneOpt = opt === 'None' || opt === 'Tamed'
                      const toggle = () => {
                        if (noneOpt) {
                          setBehavioralIssues([opt])
                        } else {
                          setBehavioralIssues(prev => {
                            const without = prev.filter(v => v !== 'None' && v !== 'Tamed')
                            return without.includes(opt)
                              ? without.filter(v => v !== opt)
                              : [...without, opt]
                          })
                        }
                      }
                      return (
                        <div
                          key={opt}
                          role="checkbox"
                          aria-checked={selected}
                          onClick={toggle}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                            selected
                              ? 'border-secondary bg-secondary text-white'
                              : 'border-gray-200 text-gray-700 hover:border-secondary/40'
                          }`}
                        >
                          <span className={`text-xs font-mono w-5 ${selected ? 'text-white/70' : 'text-gray-400'}`}>
                            {String(i + 1).padStart(2, '0')}.
                          </span>
                          <span className="text-sm font-medium">{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {behavioralIssues.includes('Other') && (
                  <div>
                    <label className={labelClass}>Please describe the behavioral issue</label>
                    <textarea
                      value={behavioralOtherDesc}
                      onChange={(e) => setBehavioralOtherDesc(e.target.value)}
                      rows={3}
                      placeholder="Describe the behavioral issue…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}

                {/* Note */}
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
                  <p className="text-xs text-secondary leading-relaxed">
                    <span className="font-bold">Note:</span>{' '}
                    Above information will be helpful for better understanding of your pet for the host
                  </p>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Pet Profile')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
