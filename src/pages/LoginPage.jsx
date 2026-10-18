import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch {
      toast.error('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🐾</span>
          <h1 className="font-display text-3xl font-bold text-warm-900 mt-3">Sign in</h1>
          <p className="text-warm-500 mt-1">Welcome back to House of boarding</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-warm-200 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              placeholder="you@example.com"
              className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
              className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-warm-500 mt-4">
          Don't have an account?{' '}
          <Link to="/" className="text-brand-600 font-medium hover:underline">Get in touch</Link>
        </p>
      </div>
    </div>
  )
}
