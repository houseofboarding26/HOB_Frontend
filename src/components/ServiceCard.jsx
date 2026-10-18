export default function ServiceCard({ service, onSelect, selected }) {
  return (
    <div
      className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50'
          : 'border-warm-200 bg-white hover:border-brand-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect?.(service)}
    >
      <h3 className="font-display font-semibold text-warm-900 text-lg mb-1">{service.name}</h3>
      <p className="text-sm text-warm-500 mb-4">{service.description}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-brand-600">₹{service.price}</span>
        <span className="text-sm text-warm-400">{service.unit}</span>
      </div>
    </div>
  )
}
