import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Search, Home } from 'lucide-react'

const roles = [
  {
    id: 'customer',
    icon: Search,
    title: 'Pet Owner',
    desc: 'Find trusted hosts and book stays for your pets.',
    features: ['Browse verified hosts', 'Book overnight stays', 'Track your bookings'],
    cta: 'I want to find a host',
  },
  {
    id: 'host',
    icon: Home,
    title: 'Pet Host',
    desc: 'Earn money by boarding pets in your home.',
    features: ['List your property', 'Accept bookings', 'Set your own prices'],
    cta: 'I want to host pets',
  },
]

export default function RoleSelection() {
  const { setRole, user } = useAuth()
  const navigate = useNavigate()

  const handleSelect = (role) => {
    setRole(role)
    toast.success(`Welcome as a ${role === 'customer' ? 'Pet Owner' : 'Host'}!`)
    navigate(role === 'customer' ? '/' : '/host/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <span className="text-4xl">🐾</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">How will you use House of boarding Boarding?</h1>
          <p className="text-gray-500 mt-2">You can always switch roles later from settings.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map(({ id, icon: Icon, title, desc, features, cta }) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-left hover:border-secondary hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-white transition-colors">
                <Icon size={28} className="text-secondary group-hover:text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 text-sm mb-5">{desc}</p>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="inline-block w-full text-center py-2.5 bg-secondary text-white font-semibold rounded-lg text-sm group-hover:bg-secondary-dark transition-colors">
                {cta}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
