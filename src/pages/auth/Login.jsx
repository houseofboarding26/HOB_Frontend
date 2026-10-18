import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { startGoogleLogin } from '../../services/authService'
import { Eye, EyeOff, LogIn, Shield, Star, Clock } from 'lucide-react'
import hobLogo from '../../assets/hob-logo.png';

const ROLE_DASHBOARD = {
  customer: '/',
  host: '/host/dashboard',
  admin: '/admin/dashboard',
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      // Return the user to wherever they were headed before logging in
      // (e.g. a host page where they clicked "Book Now").
      const redirect = location.state?.from || localStorage.getItem('postLoginRedirect')
      localStorage.removeItem('postLoginRedirect')
      navigate(redirect || ROLE_DASHBOARD[user.role] || '/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-secondary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <img className='hob-login-page-logo' src={hobLogo} alt='' />
        </Link>

        <div className="relative">
          <div className="text-7xl mb-8 select-none">🐕</div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Your pet deserves<br />
            <span className="text-primary">the best stay.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Thousands of verified hosts ready to welcome your furry family member with love and care.
          </p>
          <div className="space-y-3">
            {[
              { icon: Shield, text: 'All hosts are background-verified' },
              { icon: Star,   text: '4.9 ★ average rating across all stays' },
              { icon: Clock,  text: '24/7 support for every booking' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-primary" />
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative bg-white/10 rounded-2xl p-5 border border-white/15">
          <p className="text-white/80 text-sm italic leading-relaxed">
            "Finding a trustworthy host for my Lab was so easy. Bruno came back happy and I got photo updates all day!"
          </p>
          <p className="text-primary font-semibold text-sm mt-3">— Sneha K., Bangalore</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#FFFDF5] px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center">
              <img className='hob-logo' src={hobLogo} alt='' />
            </Link>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Sign in to your House of boarding account</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={() => {
              // Remember where the user was headed so AuthCallback can send
              // them back after Google completes the sign-in.
              const from = location.state?.from
              if (from) localStorage.setItem('postLoginRedirect', from)
              startGoogleLogin()
            }}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium px-1">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all
                  ${errors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-secondary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm outline-none transition-all
                    ${errors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary-dark transition-colors disabled:opacity-60 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to House of boarding?{' '}
            <Link
              to="/register"
              state={location.state?.from ? { from: location.state.from } : undefined}
              className="text-secondary font-semibold hover:underline"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
