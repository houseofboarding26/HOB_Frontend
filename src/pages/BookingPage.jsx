import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { mockServices } from '../mock/services'
import { getPets } from '../services/petService'
import { createBooking } from '../services/bookingService'
import ServiceCard from '../components/ServiceCard'

export default function BookingPage() {
  const [pets, setPets] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { getPets().then(setPets) }, [])

  const onSubmit = async (data) => {
    if (!selectedService) {
      toast.error('Please select a service')
      return
    }
    setSubmitting(true)
    try {
      await createBooking({ ...data, serviceId: selectedService.id })
      toast.success("Booking confirmed! We'll be in touch.")
      reset()
      setSelectedService(null)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl font-bold text-warm-900 mb-2">Book a Stay</h1>
      <p className="text-warm-500 mb-10">Fill in the details below and we'll confirm your booking.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Service selection */}
        <section>
          <h2 className="font-display text-xl font-semibold text-warm-900 mb-4">Select a service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockServices.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                selected={selectedService?.id === s.id}
                onSelect={setSelectedService}
              />
            ))}
          </div>
        </section>

        {/* Pet selection */}
        <section>
          <h2 className="font-display text-xl font-semibold text-warm-900 mb-4">Which pet?</h2>
          <select
            {...register('petId', { required: 'Please select a pet' })}
            className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Select a pet…</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
            ))}
          </select>
          {errors.petId && <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>}
        </section>

        {/* Dates */}
        <section>
          <h2 className="font-display text-xl font-semibold text-warm-900 mb-4">Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Check-in</label>
              <input
                type="date"
                {...register('checkIn', { required: 'Required' })}
                className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Check-out</label>
              <input
                type="date"
                {...register('checkOut', { required: 'Required' })}
                className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut.message}</p>}
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="font-display text-xl font-semibold text-warm-900 mb-4">Any notes?</h2>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Medications, dietary needs, favourite toys…"
            className="w-full border border-warm-300 rounded-xl px-4 py-3 text-warm-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {submitting ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}
