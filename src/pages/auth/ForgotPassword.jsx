import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, ArrowLeft, Shield, Star, Clock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import hobLogo from '../../assets/hob-logo.png'
import api from '../../services/api'

const STEPS = { EMAIL: 'email', RESET: 'reset', SUCCESS: 'success' }

function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-secondary flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <Link to="/" className="relative flex items-center gap-2.5">
        <img className="hob-login-page-logo" src={hobLogo} alt="" />
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
  )
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {['Send OTP', 'Reset Password'].map((label, i) => {
        const stepNum = i + 1
        const active = current === STEPS.EMAIL ? stepNum === 1 : stepNum === 2
        const done = current === STEPS.RESET && stepNum === 1
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              done ? 'bg-green-500 text-white' : active ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {done ? '✓' : stepNum}
            </div>
            <span className={`text-xs font-medium ${active || done ? 'text-gray-700' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

// Step 1 — enter email and receive OTP
function EmailStep({ onOtpSent }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      toast.success('OTP sent to your email!')
      onOtpSent(email)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium hover:text-secondary transition-colors mb-6">
        <ArrowLeft size={15} />
        Back to Sign In
      </Link>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Forgot password?</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Enter your registered email and we'll send you a one-time password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
              errors.email
                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary-dark transition-colors disabled:opacity-60 shadow-sm mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending OTP…
            </>
          ) : (
            <>
              <Mail size={17} />
              Send OTP
            </>
          )}
        </button>
      </form>
    </>
  )
}

// Step 2 — enter OTP + new password
function ResetStep({ email, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ otp, newPassword, confirmPassword }) => {
    setLoading(true)
    try {
      await api.put('/auth/forgetpassword', { email, otp, newPassword, confirmPassword })
      toast.success('Password reset successfully!')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setResending(true)
    try {
      await api.post('/auth/send-otp', { email })
      toast.success('OTP resent!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-medium hover:text-secondary transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Change email
      </button>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Reset password</h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          We sent an OTP to <span className="font-semibold text-secondary">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-gray-700">OTP</label>
            <button
              type="button"
              onClick={resendOtp}
              disabled={resending}
              className="text-xs text-secondary font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            {...register('otp', { required: 'OTP is required' })}
            placeholder="Enter OTP"
            className={`w-full px-4 py-3 border rounded-xl text-sm outline-none tracking-widest transition-all ${
              errors.otp
                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
            }`}
          />
          {errors.otp && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.otp.message}</p>}
        </div>

        {/* New password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              placeholder="••••••••"
              className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm outline-none transition-all ${
                errors.newPassword
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.newPassword.message}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('newPassword') || 'Passwords do not match',
              })}
              placeholder="••••••••"
              className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm outline-none transition-all ${
                errors.confirmPassword
                  ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
              }`}
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
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary-dark transition-colors disabled:opacity-60 shadow-sm mt-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Resetting…
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </>
  )
}

// Step 3 — success
function SuccessStep() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={28} className="text-green-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Password reset!</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        Your password has been updated successfully. You can now sign in with your new password.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary-dark transition-colors shadow-sm"
      >
        Back to Sign In
      </Link>
    </div>
  )
}

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />

      <div className="flex-1 flex items-center justify-center bg-[#FFFDF5] px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <Link to="/" className="inline-flex items-center">
              <img className="hob-logo" src={hobLogo} alt="" />
            </Link>
          </div>

          {step !== STEPS.SUCCESS && <StepIndicator current={step} />}

          {step === STEPS.EMAIL && (
            <EmailStep onOtpSent={(e) => { setEmail(e); setStep(STEPS.RESET) }} />
          )}
          {step === STEPS.RESET && (
            <ResetStep
              email={email}
              onBack={() => setStep(STEPS.EMAIL)}
              onSuccess={() => setStep(STEPS.SUCCESS)}
            />
          )}
          {step === STEPS.SUCCESS && <SuccessStep />}
        </div>
      </div>
    </div>
  )
}
