import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import hobLogo from '../../assets/hob-logo.png'

export default function Register() {
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const password = watch('password', '')

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const map = [
      { label: 'Too short', color: 'bg-red-400' },
      { label: 'Weak',      color: 'bg-red-400' },
      { label: 'Fair',      color: 'bg-yellow-400' },
      { label: 'Good',      color: 'bg-blue-400' },
      { label: 'Strong',    color: 'bg-green-500' },
    ]
    return { score, ...map[score] }
  }

  const strength = getStrength(password)

  const onSubmit = async (data) => {
    try {
      const user = await registerUser({ ...data, role: 'customer' })
      toast.success(`Welcome to House of boarding, ${user.name}!`)
      // Return the user to wherever they were headed before signing up
      // (e.g. a host page where they clicked "Book Now").
      const redirect = location.state?.from || localStorage.getItem('postLoginRedirect')
      localStorage.removeItem('postLoginRedirect')
      navigate(redirect || '/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  const inputClass = (hasError) =>
    `w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
        : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
    }`

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[40%] bg-secondary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <Link to="/" className="relative flex items-center">
          <img className='hob-login-page-logo' src={hobLogo} alt='' />
        </Link>

        <div className="relative">
          <div className="text-7xl mb-8 select-none">🏡</div>
          <h2 className="text-4xl font-extrabold text-white leading-snug mb-4">
            Join thousands of<br />
            <span className="text-primary">happy pet families.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            Whether you're a pet owner looking for the perfect stay or a host ready to welcome new furry friends — House of boarding has a place for you.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🐕', value: '10K+', label: 'Happy Pets' },
              { emoji: '🏠', value: '500+', label: 'Verified Hosts' },
              { emoji: '⭐', value: '4.9',  label: 'Avg Rating' },
              { emoji: '🔒', value: '100%', label: 'Secure Stays' },
            ].map(({ emoji, value, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-xl mb-0.5">{emoji}</p>
                <p className="text-white font-bold text-lg leading-none">{value}</p>
                <p className="text-white/50 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">
          By creating an account you agree to our{' '}
          <span className="text-white/60 underline cursor-pointer">Terms of Service</span>
          {' '}and{' '}
          <span className="text-white/60 underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-start justify-center bg-[#FFFDF5] px-4 sm:px-6 py-8 sm:py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center">
              <img className='hob-logo' src={hobLogo} alt='' />
            </Link>
          </div>

          <div className="mb-6 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1.5 text-sm">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                {...register('name', { required: 'Full name is required' })}
                placeholder="Priya Sharma"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                placeholder="you@example.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  placeholder="Min. 6 characters"
                  className={`${inputClass(!!errors.password)} pr-11`}
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? 'text-red-500' :
                    strength.score === 2 ? 'text-yellow-600' :
                    strength.score === 3 ? 'text-blue-500' : 'text-green-600'
                  }`}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  placeholder="Re-enter your password"
                  className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-gray-900 font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-800 rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  Create Free Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              state={location.state?.from ? { from: location.state.from } : undefined}
              className="text-secondary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
