import { Link } from 'react-router-dom'
import hobLogo from '../assets/hob-logo.png'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white/50 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center">
          <img className="hob-login-page-logo mb-0" src={hobLogo} alt="House of boarding" />
        </div>
        <p>© {new Date().getFullYear()} House of boarding. All rights reserved.</p>
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
  )
}
