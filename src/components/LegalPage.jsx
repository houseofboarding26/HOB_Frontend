// Shared shell for the static legal pages (Privacy, Terms, Cancellation).
// Keeps a consistent header band + content card across all of them.
export default function LegalPage({ title, subtitle, lastUpdated, children }) {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header band */}
      <div className="bg-secondary relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 py-12">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
          {subtitle && <p className="text-white/70 text-sm mt-2 max-w-xl">{subtitle}</p>}
          {lastUpdated && (
            <p className="text-white/50 text-xs mt-4">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-9">
          {children}
        </div>
      </div>
    </div>
  )
}

// A numbered section with a heading and body text.
export function Section({ n, title, children }) {
  return (
    <section className="mb-7 last:mb-0">
      <h2 className="text-lg font-bold text-gray-900 mb-2.5">
        {n != null && <span className="text-secondary">{n}. </span>}
        {title}
      </h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}
