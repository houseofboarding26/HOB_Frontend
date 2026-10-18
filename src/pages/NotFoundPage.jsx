import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-7xl mb-6">🐾</p>
        <h1 className="font-display text-4xl font-bold text-warm-900 mb-2">Page not found</h1>
        <p className="text-warm-500 mb-8">Looks like this page wandered off. Let's get you back home.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
