import { useState, useEffect } from 'react'

const COOKIE_KEY = 'hob_cookie_consent'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY)
    if (!saved) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const handleDeny = () => {
    localStorage.setItem(COOKIE_KEY, 'denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl mt-0.5">🍪</span>
          <p className="text-sm text-gray-300 leading-relaxed">
            We use cookies to enhance your browsing experience and provide personalized services.
            By clicking "Accept All", you consent to our use of cookies.{' '}
            <a
              href="/privacy"
              className="underline text-[#F5C842] hover:text-yellow-300 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={handleDeny}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Deny
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[#F5C842] text-gray-900 text-sm font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
