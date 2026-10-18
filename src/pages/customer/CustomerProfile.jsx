import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { PawPrint, Plus, BookOpen, Search, LogOut, Mail, User, ChevronRight, Loader2, Pencil } from 'lucide-react'

const PET_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🦜', smallPet: '🐹' }

export default function CustomerProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const fetchPets = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/petProfile/get', {
          params: { userId: user.id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        // API shape: { data: [ {...pet...} ] }
        const list = Array.isArray(res.data) ? res.data : res.data?.data || []
        if (active) setPets(list)
      } catch (err) {
        console.error('[petProfile/get]', err)
        if (active) setError('Could not load your pets. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchPets()
    return () => { active = false }
  }, [user?.id])

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Profile header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
              <User size={30} className="text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{user?.name}</h1>
              {user?.email && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                  <Mail size={13} /> {user.email}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* ── My Pets ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PawPrint size={18} className="text-secondary" />
              My Pets
            </h2>
            <Link
              to="/pet-profile"
              className="flex items-center gap-1.5 text-sm text-secondary hover:underline font-medium"
            >
              <Plus size={14} /> Create Pet Profile
            </Link>
          </div>

          {loading ? (
            <div className="px-6 py-10 flex items-center justify-center text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading your pets…
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : pets.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-gray-500 text-sm">No pet profiles yet.</p>
              <Link
                to="/pet-profile"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-secondary font-semibold hover:underline"
              >
                <Plus size={14} /> Create your first pet profile
              </Link>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  to={`/pet-profile/${pet.id}`}
                  className="group flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-secondary/40 hover:shadow-sm transition-all"
                >
                  <div className="text-3xl shrink-0">{PET_EMOJI[pet.petType] || '🐾'}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{pet.petName || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[pet.petType, pet.breed].filter(Boolean).join(' · ')}
                    </p>
                    {(pet.petAge || pet.petAge === 0) && (
                      <p className="text-xs text-gray-400 mt-0.5">{pet.petAge} months</p>
                    )}
                    {(pet.petGender || pet.petSize) && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {pet.petGender && (
                          <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                            {pet.petGender}
                          </span>
                        )}
                        {pet.petSize && (pet.petType || '').toLowerCase() === 'dog' && (
                          <span className="text-xs bg-primary/10 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                            {pet.petSize}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      type="button"
                      title="Edit pet profile"
                      aria-label="Edit pet profile"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/pet-profile/${pet.id}/edit`, { state: { pet } })
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/my-bookings"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-secondary" />
            </div>
            <div>
              <p className="font-bold text-gray-900">My Bookings</p>
              <p className="text-xs text-gray-500">View and manage your stays</p>
            </div>
          </Link>
          <Link
            to="/hosts"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Search size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Browse Hosts</p>
              <p className="text-xs text-gray-500">Find a place for your pet</p>
            </div>
          </Link>
        </div>

        {/* Mobile logout */}
        <button
          onClick={logout}
          className="sm:hidden mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  )
}
