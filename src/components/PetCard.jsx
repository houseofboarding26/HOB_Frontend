const speciesEmoji = { Dog: '🐕', Cat: '🐈', default: '🐾' }

export default function PetCard({ pet, onEdit, onDelete }) {
  const emoji = speciesEmoji[pet.species] || speciesEmoji.default

  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="text-4xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-warm-900 text-lg">{pet.name}</h3>
        <p className="text-sm text-warm-500">{pet.breed} · {pet.age} months</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(pet)}
            className="text-xs px-3 py-1.5 rounded-lg border border-warm-300 text-warm-600 hover:bg-warm-50 transition-colors"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(pet.id)}
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
