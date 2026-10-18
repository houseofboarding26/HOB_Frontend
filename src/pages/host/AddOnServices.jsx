import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { mockAddOnServices } from '../../mock/data'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AddOnServices() {
  const [services, setServices] = useState(mockAddOnServices)
  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onAdd = (data) => {
    setServices(prev => [...prev, { id: Date.now(), name: data.name, price: Number(data.price), unit: data.unit, active: true }])
    toast.success('Service added!')
    reset()
    setShowForm(false)
  }

  const toggleActive = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id))
    toast.success('Service removed.')
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add-On Services</h1>
          <p className="text-gray-500 mt-1">Offer additional services to earn more per booking.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-dark text-sm shrink-0"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add Service</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onAdd)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input {...register('name', { required: 'Required' })} placeholder="Morning Walk" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary" />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
              <input type="number" {...register('price', { required: 'Required', min: 1 })} placeholder="15" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
              <select {...register('unit')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white">
                <option>session</option>
                <option>day</option>
                <option>hour</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-secondary text-white font-semibold rounded-lg text-sm hover:bg-secondary-dark">Save</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {services.map(s => (
          <div key={s.id} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3">
            <div>
              <p className="font-medium text-gray-900">{s.name}</p>
              <p className="text-sm text-gray-500">₹{s.price} / {s.unit}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => toggleActive(s.id)} className="text-gray-400 hover:text-secondary">
                {s.active ? <ToggleRight size={22} className="text-success" /> : <ToggleLeft size={22} />}
              </button>
              <button onClick={() => deleteService(s.id)} className="text-gray-400 hover:text-error">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
