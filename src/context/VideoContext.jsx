import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
  )
  return match ? match[1] : null
}

const VideoContext = createContext(null)

export function VideoProvider({ children }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/videos/get')
      .then((res) => {
        const raw = res.data
        const data = raw?.videos ?? raw?.data?.videos ?? raw?.data ?? raw
        setVideos(Array.isArray(data) ? data : [])
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [])

  const addVideo = async (url, title) => {
    const id = extractYouTubeId(url)
    if (!id) throw new Error('Invalid YouTube URL')
    const res = await api.post('/videos/add', { title: title || 'Untitled Video', url })
    const newVideo = res.data?.video || res.data || { url, title: title || 'Untitled Video' }
    setVideos((prev) => [...prev, newVideo])
  }

  const removeVideo = async (videoId) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    await api.put(`/videos/delete/${videoId}`, { name: user.name, email: user.email })
    setVideos((prev) => prev.filter((v) => v._id !== videoId && v.id !== videoId))
  }

  return (
    <VideoContext.Provider value={{ videos, loading, addVideo, removeVideo, extractYouTubeId }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideos() {
  const ctx = useContext(VideoContext)
  if (!ctx) throw new Error('useVideos must be used within VideoProvider')
  return ctx
}
