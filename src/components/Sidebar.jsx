import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import hobLogo from '../assets/hob-logo.png';
import {
  LayoutDashboard, Search, BookOpen,
  Home, ClipboardList,
  BarChart2, CreditCard, Users, LogOut, PawPrint, Video, Image,
  Menu, X,
} from 'lucide-react'

const CUSTOMER_LINKS = [
  { to: '/customer/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/browse',      icon: Search,          label: 'Browse Hosts' },
  { to: '/customer/my-bookings', icon: BookOpen,        label: 'My Bookings' },
  { to: '/customer/pet-profile', icon: PawPrint,        label: 'My Pets' },
]

const HOST_LINKS = [
  { to: '/host/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/host/property', icon: Home, label: 'My Property' },
  { to: '/host/requests', icon: ClipboardList, label: 'Booking Requests' },
]

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: BarChart2, label: 'Dashboard' },
  { to: '/admin/bookings', icon: BookOpen, label: 'All Bookings' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
]

const LINKS_BY_ROLE = {
  customer: CUSTOMER_LINKS,
  host: HOST_LINKS,
  admin: ADMIN_LINKS,
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const links = LINKS_BY_ROLE[user?.role] || []
  const [isOpen, setIsOpen] = useState(false)

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-secondary text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-60 bg-secondary flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:z-auto lg:min-h-screen lg:shrink-0
        `}
      >
        {/* Close button — mobile only */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Link to="/" onClick={closeSidebar}>
              <img className='hob-sidebar-logo' src={hobLogo} alt='Home' />
            </Link>
          </div>
          <div className="mt-3 px-2 py-1.5 rounded-lg bg-white/10 flex items-center gap-2.5">
            <Avatar name={user?.name} src={user?.avatar} className="w-9 h-9 rounded-full text-xs shrink-0" />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-white/60 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-gray-900'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
