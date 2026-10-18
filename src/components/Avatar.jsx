import { useState } from 'react'

const COLORS = [
  'bg-secondary', 'bg-indigo-500', 'bg-emerald-600', 'bg-orange-500',
  'bg-pink-500', 'bg-purple-600', 'bg-teal-600', 'bg-rose-500',
]

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorOf(name) {
  let sum = 0
  for (const ch of name || '') sum += ch.charCodeAt(0)
  return COLORS[sum % COLORS.length]
}

// Renders a real image when `src` is provided (e.g. a gravatar/profile photo),
// otherwise falls back to the person's initials on a colour derived from the name.
// Pass sizing / rounding / text-size via `className`.
export default function Avatar({ name, src, className = '', style }) {
  const [broken, setBroken] = useState(false)

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name || ''}
        style={style}
        onError={() => setBroken(true)}
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div
      style={style}
      aria-label={name || ''}
      className={`flex items-center justify-center font-bold text-white select-none ${colorOf(name)} ${className}`}
    >
      {initialsOf(name)}
    </div>
  )
}
