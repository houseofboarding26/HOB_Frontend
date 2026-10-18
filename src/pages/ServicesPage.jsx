import { Link } from 'react-router-dom'
import { mockServices } from '../mock/services'
import ServiceCard from '../components/ServiceCard'

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl font-bold text-warm-900 mb-2">Our Services</h1>
      <p className="text-warm-500 mb-12">Transparent pricing, no surprises.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {mockServices.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/booking"
          className="inline-block px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
        >
          Book now
        </Link>
      </div>
    </div>
  )
}
