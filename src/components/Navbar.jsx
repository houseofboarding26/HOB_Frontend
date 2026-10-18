import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, ChevronDown } from 'lucide-react'
import Avatar from './Avatar'
import hobLogo from '../assets/hob-logo.png';

const ROLE_DASHBOARD = {
  host: '/host/dashboard',
  admin: '/admin/dashboard',
}

// Dropdown menu shown for a logged-in customer: name → View Profile / Logout.
function CustomerMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
      >
        <Avatar name={user.name} src={user.avatar} className="w-8 h-8 rounded-full text-xs shrink-0" />
        <span className="hidden sm:inline font-medium max-w-[10rem] truncate">{user.name}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
          <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            {user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={15} className="text-gray-400" />
            View Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={15} className="text-gray-400" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img className='hob-logo' src={hobLogo} alt='' />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            user.role === 'customer' ? (
              <CustomerMenu user={user} logout={logout} />
            ) : (
              <>
                <Link
                  to={ROLE_DASHBOARD[user.role] || '/'}
                  className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Avatar name={user.name} src={user.avatar} className="w-8 h-8 rounded-full text-xs shrink-0" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-gray-900 text-xs font-medium capitalize">{user.role}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            )
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 sm:px-4 py-2 rounded-lg bg-primary text-gray-900 font-semibold hover:bg-yellow-400 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
