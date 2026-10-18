import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useVideos } from '../../context/VideoContext'
import { Plus, Trash2, ExternalLink, Video, Loader2 } from 'lucide-react'

export default function VideoManagement() {
  const { videos, loading, addVideo, removeVideo, extractYouTubeId } = useVideos()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  const handleAdd = async () => {
    if (!url.trim()) return toast.error('YouTube URL required')
    setAdding(true)
    try {
      await addVideo(url.trim(), title.trim())
      toast.success('Video added!')
      setUrl('')
      setTitle('')
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to add video')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await removeVideo(id)
      toast.success('Video removed')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to remove video')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
        <p className="text-gray-500 mt-1">Manage YouTube videos shown on the home page slider.</p>
      </div>

      {/* Add Video */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-secondary" />
          Add New Video
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Pet Boarding Spaces"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-semibold rounded-xl text-sm hover:bg-secondary-dark transition-colors disabled:opacity-60"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {adding ? 'Adding…' : 'Add Video'}
          </button>
        </div>
      </div>

      {/* Video List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Home Page Videos</h2>
          <span className="text-sm text-gray-400">{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 size={28} className="mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Loading videos…</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Video size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No videos added yet. Add a YouTube URL above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {videos.map((video, i) => {
              const id = video._id || video.id
              const ytId = extractYouTubeId(video.url)
              return (
                <div key={id} className="p-4 flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-300 w-5 shrink-0">{i + 1}</span>
                  {ytId && (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-24 h-14 object-cover rounded-lg shrink-0 bg-gray-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{video.url}</p>
                  </div>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleRemove(id)}
                    disabled={removingId === id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {removingId === id
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Trash2 size={16} />
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Videos play automatically (muted) on the home page. Supports youtube.com and youtu.be links.
      </p>
    </div>
  )
}
