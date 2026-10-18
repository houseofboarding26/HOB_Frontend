import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const BannerContext = createContext(null)

function normalizeBanner(b) {
  return {
    ...b,
    id:       b._id || b.id,
    imageUrl: b.imageUrl || b.image || b.bannerUrl || b.url || '',
    link:     b.link || b.clickUrl || '',
    title:    b.title || b.name || 'Banner',
  }
}

export function BannerProvider({ children }) {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/banners/get')
      .then((res) => {
        const raw = res.data?.banners ?? res.data?.data ?? res.data
        const list = Array.isArray(raw) ? raw : []
        setBanners(list.map(normalizeBanner))
      })
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }, [])

  const addBanner = async (imageFile, link, title) => {
    const formData = new FormData()
    formData.append('banner', imageFile)
    formData.append('data', JSON.stringify({ link, title }))

    const res = await api.post('/banners/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const newBanner = normalizeBanner(res.data?.banner || res.data)
    setBanners((prev) => [...prev, newBanner])
  }

  const removeBanner = async (id) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    await api.put(`/banners/delete/${id}`, { name: user.name, email: user.email })
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <BannerContext.Provider value={{ banners, loading, addBanner, removeBanner }}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBanners() {
  const ctx = useContext(BannerContext)
  if (!ctx) throw new Error('useBanners must be used within BannerProvider')
  return ctx
}
