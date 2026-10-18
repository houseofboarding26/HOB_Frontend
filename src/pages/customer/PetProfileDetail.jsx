import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ChevronLeft, Loader2, PawPrint, Phone, Mail, MapPin,
  Calendar, Shield, Stethoscope, Brain, Pencil,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { formatDate as formatDateUtil } from '../../utils/formatDate'

const PET_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🦜', smallPet: '🐹' }

const formatDate = (value) => formatDateUtil(value) || '—'

const yesNo = (v) => (v ? 'Yes' : 'No')

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5 break-words">{value || '—'}</p>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <Icon size={17} className="text-secondary" />
        <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function PetProfileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchPet = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/petProfile/get', {
          params: { userId: user?.id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const list = Array.isArray(res.data) ? res.data : res.data?.data || []
        const found = list.find((p) => String(p.id) === String(id))
        if (active) {
          if (found) setPet(found)
          else setError('Pet profile not found.')
        }
      } catch (err) {
        console.error('[petProfile/get]', err)
        if (active) setError('Could not load this pet profile.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchPet()
    return () => { active = false }
  }, [id, user?.id])

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center py-20">
        <Loader2 size={22} className="animate-spin text-secondary" />
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="bg-gray-50 min-h-full py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500 mb-4">{error || 'Pet profile not found.'}</p>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-secondary font-semibold hover:underline"
          >
            ← Back to profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-secondary mb-5 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl shrink-0">{PET_EMOJI[pet.petType] || '🐾'}</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold text-gray-900 truncate">{pet.petName || 'Unnamed'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {[pet.petType, pet.breed].filter(Boolean).join(' · ')}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {pet.petGender && (
                  <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-medium">
                    {pet.petGender}
                  </span>
                )}
                {pet.petSize && (pet.petType || '').toLowerCase() === 'dog' && (
                  <span className="text-xs bg-primary/10 text-yellow-700 px-2.5 py-0.5 rounded-full font-medium">
                    {pet.petSize}
                  </span>
                )}
                {(pet.petAge || pet.petAge === 0) && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                    {pet.petAge} months
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/pet-profile/${pet.id}/edit`, { state: { pet } })}
              className="flex items-center gap-1.5 text-sm font-semibold text-secondary border border-secondary/30 px-3 py-2 rounded-xl hover:bg-secondary/10 transition-colors shrink-0"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Pet details */}
          <SectionCard icon={PawPrint} title="Pet Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pet name" value={pet.petName} />
              <Field label="Pet type" value={pet.petType} />
              <Field label="Breed" value={pet.breed} />
              <Field label="Age" value={(pet.petAge || pet.petAge === 0) ? `${pet.petAge} months` : ''} />
              <Field label="Gender" value={pet.petGender} />
              {(pet.petType || '').toLowerCase() === 'dog' && <Field label="Size" value={pet.petSize} />}
              <div className="col-span-2">
                <Field label="Colour & markings" value={pet.colorAndMarkings} />
              </div>
            </div>
          </SectionCard>

          {/* Parent details */}
          <SectionCard icon={Mail} title="Parent Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={pet.name} />
              <div className="flex items-start gap-2">
                <Phone size={14} className="text-gray-300 mt-0.5 shrink-0" />
                <Field label="Contact" value={pet.contactNumber} />
              </div>
              <div className="col-span-2 flex items-start gap-2">
                <Mail size={14} className="text-gray-300 mt-0.5 shrink-0" />
                <Field label="Email" value={pet.email} />
              </div>
              <div className="col-span-2 flex items-start gap-2">
                <MapPin size={14} className="text-gray-300 mt-0.5 shrink-0" />
                <Field label="Address" value={pet.addressPet} />
              </div>
            </div>
          </SectionCard>

          {/* Vaccination & tick */}
          <SectionCard icon={Shield} title="Vaccination & Tick Care">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-300 mt-0.5 shrink-0" />
                <Field label="Vaccination date" value={formatDate(pet.vacinationdate)} />
              </div>
              <Field label="Tick treatment done" value={yesNo(pet.tickTreatmentStatus)} />
            </div>
          </SectionCard>

          {/* Health */}
          <SectionCard icon={Stethoscope} title="Health & Medical">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Health issues (30 days)" value={yesNo(pet.healthIssues)} />
                <Field label="Medical history" value={yesNo(pet.medicalHistory)} />
              </div>
              {pet.healthIssues && pet.healthIssuesDescription && (
                <Field label="Health issue details" value={pet.healthIssuesDescription} />
              )}
              {pet.medicalHistory && pet.medicalHistoryDescription && (
                <Field label="Medical history details" value={pet.medicalHistoryDescription} />
              )}
            </div>
          </SectionCard>

          {/* Behaviour */}
          <SectionCard icon={Brain} title="Behaviour">
            <div className="space-y-4">
              <Field label="Behavioural issues" value={yesNo(pet.behavioralIssues)} />
              {pet.behavioralIssues && pet.behavioralIssuesDescription && (
                <Field label="Details" value={pet.behavioralIssuesDescription} />
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
