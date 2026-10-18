import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PetCard from '../components/PetCard'
import { getPets, deletePet } from '../services/petService'

export default function PetsPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPets()
      .then(setPets)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await deletePet(id)
    setPets((prev) => prev.filter((p) => p.id !== id))
    toast.success('Pet removed')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-warm-900">My Pets</h1>
          <p className="text-warm-500 mt-1">Manage your furry family members.</p>
        </div>
        <button className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors">
          + Add Pet
        </button>
      </div>

      {loading ? (
        <p className="text-warm-400">Loading pets…</p>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🐾</p>
          <p className="text-warm-500">No pets added yet. Add your first pet to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
