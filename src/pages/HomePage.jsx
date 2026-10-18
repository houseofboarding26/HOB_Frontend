import { Link } from 'react-router-dom'
import { mockServices } from '../mock/services'
import ServiceCard from '../components/ServiceCard'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sage-700 to-sage-900 text-white py-14 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sage-300 text-sm font-medium uppercase tracking-widest mb-4">
            A home away from home
          </p>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your pet deserves<br />the very best care
          </h1>
          <p className="text-sage-200 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
            Trusted boarding, daycare, and grooming in a warm, family-run environment.
            Every pet gets the love and attention they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/booking"
              className="px-8 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl transition-colors"
            >
              Book a Stay
            </Link>
            <Link
              to="/services"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-warm-900 mb-2">Our Services</h2>
        <p className="text-warm-500 mb-8 sm:mb-10">Everything your pet needs, all in one place.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockServices.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="bg-warm-100 py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-warm-900 mb-8 sm:mb-12">Why pet owners trust House of boarding</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: '🏡', title: 'Home Environment', desc: 'Small, intimate setting so your pet never feels lost in a crowd.' },
              { icon: '💉', title: 'Vet-Approved', desc: 'All guests are vaccination-checked before their first stay.' },
              { icon: '📸', title: 'Daily Updates', desc: 'Photos and updates every day so you can stay connected.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-display font-semibold text-warm-900 text-lg mb-2">{title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
