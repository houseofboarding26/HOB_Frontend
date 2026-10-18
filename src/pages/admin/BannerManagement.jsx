import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useBanners } from '../../context/BannerContext'
import { Plus, Trash2, ExternalLink, Image, UploadCloud, X, Loader2 } from 'lucide-react'

const MAX_SIZE_MB = 7
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function BannerManagement() {
  const { banners, loading, addBanner, removeBanner } = useBanners()
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [link, setLink]             = useState('')
  const [title, setTitle]           = useState('')
  const [dragging, setDragging]     = useState(false)
  const [adding, setAdding]         = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const fileInputRef = useRef(null)

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed (JPG, PNG, WEBP, etc.)')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Image is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`)
      return
    }
    // Revoke previous preview URL to free memory
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    const url = URL.createObjectURL(file)
    setImageFile(file)
    setImagePreview(url)
  }

  const handleFileInput = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAdd = async () => {
    if (!imageFile)   return toast.error('Please upload a banner image')
    if (!link.trim()) return toast.error('Click link is required')
    setAdding(true)
    try {
      await addBanner(imageFile, link.trim(), title.trim())
      toast.success('Banner added!')
      clearImage()
      setLink('')
      setTitle('')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add banner')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await removeBanner(id)
      toast.success('Banner removed')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to remove banner')
    } finally {
      setRemovingId(null)
    }
  }

  const fileSizeMB = imageFile ? (imageFile.size / (1024 * 1024)).toFixed(2) : null

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        <p className="text-gray-500 mt-1">Manage promotional banners shown on the Browse Hosts page.</p>
      </div>

      {/* Add Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-secondary" />
          Add New Banner
        </h2>
        <div className="space-y-4">

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Banner Image <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-gray-400 ml-2">Max {MAX_SIZE_MB} MB · JPG, PNG, WEBP, GIF</span>
            </label>

            {imagePreview ? (
              /* Preview with remove button */
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold shadow"
                  >
                    <UploadCloud size={13} /> Change
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold shadow"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5 flex items-center justify-between">
                  <span className="text-white text-xs truncate max-w-[70%]">{imageFile?.name}</span>
                  <span className="text-white/70 text-xs shrink-0">{fileSizeMB} MB</span>
                </div>
              </div>
            ) : (
              /* Drop zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragging
                    ? 'border-secondary bg-secondary/5'
                    : 'border-gray-200 hover:border-secondary/60 hover:bg-gray-50'
                }`}
              >
                <UploadCloud size={28} className={dragging ? 'text-secondary' : 'text-gray-300'} />
                <p className="text-sm font-medium text-gray-500">
                  {dragging ? 'Drop image here' : 'Click or drag & drop to upload'}
                </p>
                <p className="text-xs text-gray-400">Max {MAX_SIZE_MB} MB</p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Click Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Click Link <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/promo"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Pet Boarding Offer"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-semibold rounded-xl text-sm hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {adding ? 'Adding…' : 'Add Banner'}
          </button>
        </div>
      </div>

      {/* Banner List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Banners</h2>
          <span className="text-sm text-gray-400">{banners.length} banner{banners.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 size={28} className="mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Loading banners…</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Image size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No banners added yet. Upload an image above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {banners.map((banner, i) => (
              <div key={banner.id} className="p-4 flex items-center gap-4">
                <span className="text-xs font-bold text-gray-300 w-5 shrink-0">{i + 1}</span>
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-28 h-16 object-cover rounded-lg shrink-0 bg-gray-100 border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{banner.title || 'Banner'}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{banner.link}</p>
                </div>
                <a
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => handleRemove(banner.id)}
                  disabled={removingId === banner.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {removingId === banner.id
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Trash2 size={16} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Banners auto-slide on the Browse Hosts page. Clicking a banner opens its link in a new tab.
      </p>
    </div>
  )
}
