// components/brand-logo.tsx
'use client'
import React from 'react'

export function BrandLogo({ srcs }: { srcs?: string[] }) {
  const DATA_URI =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='24' viewBox='0 0 120 24'><rect width='120' height='24' rx='6' fill='%231e40af'/><text x='12' y='16' font-size='12' font-family='Arial, Helvetica, sans-serif' fill='white'>KlinikIA</text></svg>`
    )

  const candidates = React.useMemo(
    () => (srcs?.length ? srcs : ["/logo_oficial.png", DATA_URI]),
    [srcs]
  )
  const [idx, setIdx] = React.useState(0)
  const [loaded, setLoaded] = React.useState(false)
  const current = candidates[Math.min(idx, candidates.length - 1)]

  React.useEffect(() => { setLoaded(false) }, [current])

  return (
    <div className="flex items-center gap-2" data-testid="brand-logo-wrapper">
      {!loaded && (
        <div className="h-6 w-[120px] rounded-md bg-blue-600 text-white grid place-items-center text-xs font-semibold select-none">
          KlinikIA
        </div>
      )}
      <img
        key={current}
        src={current}
        onLoad={() => setLoaded(true)}
        onError={() => setIdx(p => (p < candidates.length - 1 ? p + 1 : p))}
        alt="KlinikIA"
        className={`h-6 w-auto ${loaded ? '' : 'hidden'}`}
      />
      <span className="sr-only">KlinikIA</span>
    </div>
  )
}