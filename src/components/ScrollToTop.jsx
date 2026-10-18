import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router does not reset scroll on navigation, so a new page opens at the
// previous page's scroll position. This resets to the top whenever the path
// changes. Renders nothing.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
